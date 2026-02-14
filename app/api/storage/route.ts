import { NextResponse } from 'next/server';
import si from 'systeminformation';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { StorageConfig } from '@/types/storage';

const CONFIG_PATH = path.join(process.cwd(), 'app/config/storage.json');
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), 'app/config/default.json');

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DriveInfo {
    id: string;
    name: string;
    label: string;
    mount: string;
    total: number;      // bytes
    used: number;       // bytes
    available: number;  // bytes
    percentage: number; // 0-100
    icon: string;       // icon name for serialization
    found: boolean;     // whether the mount was actually found
}

interface MountInfo {
    device: string;
    mount: string;
    fstype: string;
    total: number;
    used: number;
    available: number;
    percentage: number;
}

function getStorageConfig(): StorageConfig {
    // If storage.json exists, use it
    if (existsSync(CONFIG_PATH)) {
        const data = readFileSync(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
    }

    // Fall back to default.json → storage section
    if (existsSync(DEFAULT_CONFIG_PATH)) {
        const data = readFileSync(DEFAULT_CONFIG_PATH, 'utf-8');
        const defaults = JSON.parse(data);
        if (defaults.storage) {
            return defaults.storage as StorageConfig;
        }
    }

    // Ultimate fallback
    return { drives: [] };
}

function saveStorageConfig(config: StorageConfig) {
    // Always write to storage.json (never default.json)
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

async function getHostFilesystemInfo(): Promise<MountInfo[]> {
    const mounts: MountInfo[] = [];
    const hostProcPath = '/host/proc/mounts';
    const defaultProcPath = '/proc/mounts';
    const procPath = existsSync(hostProcPath) ? hostProcPath : defaultProcPath;
    const isDocker = existsSync(hostProcPath);

    try {
        const mountsContent = readFileSync(procPath, 'utf-8');
        const lines = mountsContent.split('\n').filter(l => l.trim());

        const realFs = lines.filter(line => {
            const parts = line.split(' ');
            const device = parts[0];
            const fstype = parts[2];

            return (
                device.startsWith('/dev/') ||
                fstype === 'nfs' ||
                fstype === 'nfs4' ||
                fstype === 'cifs' ||
                fstype === 'fuse' ||
                fstype === 'fuse.rclone'
            );
        });

        for (const line of realFs) {
            const parts = line.split(' ');
            const device = parts[0];
            let mount = parts[1];
            const fstype = parts[2];

            const hostRootPrefix = '/host/root';
            const actualMount = isDocker && mount.startsWith(hostRootPrefix)
                ? mount.substring(hostRootPrefix.length) || '/'
                : mount;

            try {
                const dfPath = isDocker ? `${hostRootPrefix}${actualMount === '/' ? '' : actualMount}` : actualMount;

                if (!existsSync(dfPath)) continue;

                const dfOutput = execSync(`df -B1 "${dfPath}" 2>/dev/null | tail -1`, { encoding: 'utf-8' });
                const dfParts = dfOutput.trim().split(/\s+/);

                if (dfParts.length >= 5) {
                    const total = parseInt(dfParts[1], 10) || 0;
                    const used = parseInt(dfParts[2], 10) || 0;
                    const available = parseInt(dfParts[3], 10) || 0;
                    const percentage = parseInt(dfParts[4].replace('%', ''), 10) || 0;

                    if (total > 0 && !mounts.find(m => m.mount === actualMount)) {
                        mounts.push({
                            device,
                            mount: actualMount,
                            fstype,
                            total,
                            used,
                            available,
                            percentage,
                        });
                    }
                }
            } catch {
                continue;
            }
        }
    } catch (error) {
        console.error('Error reading mounts:', error);
    }

    return mounts;
}

export async function GET() {
    try {
        let fsData = await getHostFilesystemInfo();

        if (fsData.length === 0) {
            const siData = await si.fsSize();
            fsData = siData.map(d => ({
                device: d.fs,
                mount: d.mount,
                fstype: d.type,
                total: d.size,
                used: d.used,
                available: d.available,
                percentage: Math.round(d.use),
            }));
        }

        const config = getStorageConfig();
        const drives: DriveInfo[] = [];

        for (const configDrive of config.drives) {
            const foundMount = fsData.find(d => d.mount === configDrive.mount);

            if (foundMount) {
                drives.push({
                    id: configDrive.id,
                    name: configDrive.name,
                    label: configDrive.label,
                    mount: foundMount.mount,
                    total: foundMount.total,
                    used: foundMount.used,
                    available: foundMount.available,
                    percentage: foundMount.percentage,
                    icon: configDrive.icon || 'HardDrive',
                    found: true,
                });
            } else if (configDrive.fallback) {
                drives.push({
                    id: configDrive.id,
                    name: configDrive.name,
                    label: configDrive.label,
                    mount: configDrive.mount,
                    total: configDrive.fallback.total,
                    used: configDrive.fallback.used,
                    available: configDrive.fallback.total - configDrive.fallback.used,
                    percentage: configDrive.fallback.percentage,
                    icon: configDrive.icon || 'HardDrive',
                    found: false,
                });
            } else {
                // Return configured but missing drive with error state
                drives.push({
                    id: configDrive.id,
                    name: configDrive.name,
                    label: configDrive.label,
                    mount: configDrive.mount,
                    total: 0,
                    used: 0,
                    available: 0,
                    percentage: 0,
                    icon: configDrive.icon || 'HardDrive',
                    found: false,
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                drives,
                totalDrives: drives.length,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Storage info error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const config: StorageConfig = await request.json();
        saveStorageConfig(config);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving storage config:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
