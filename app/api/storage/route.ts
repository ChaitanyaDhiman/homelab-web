import { NextResponse } from 'next/server';
import si from 'systeminformation';
import { storageDrives } from '@/app/config/storage';
import { readFileSync, existsSync, statSync } from 'fs';
import { execSync } from 'child_process';

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

/**
 * Parse mount info from /proc/mounts or /host/proc/mounts
 * Returns filesystem data similar to systeminformation
 */
async function getHostFilesystemInfo(): Promise<MountInfo[]> {
    const mounts: MountInfo[] = [];

    // Determine which proc to use (Docker vs host)
    const hostProcPath = '/host/proc/mounts';
    const defaultProcPath = '/proc/mounts';
    const procPath = existsSync(hostProcPath) ? hostProcPath : defaultProcPath;
    const isDocker = existsSync(hostProcPath);

    try {
        const mountsContent = readFileSync(procPath, 'utf-8');
        const lines = mountsContent.split('\n').filter(l => l.trim());

        // Filter for real filesystems (not tmpfs, proc, sys, etc.)
        const realFs = lines.filter(line => {
            const parts = line.split(' ');
            const device = parts[0];
            const fstype = parts[2];

            // Include real block devices and common network filesystems
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

            // In Docker, mounts might be under /host/root
            // We need to check both the raw mount and the host-prefixed version
            const hostRootPrefix = '/host/root';
            const actualMount = isDocker && mount.startsWith(hostRootPrefix)
                ? mount.substring(hostRootPrefix.length) || '/'
                : mount;

            try {
                // Get disk usage using df command
                // In Docker, we read from /host/root prefixed paths
                const dfPath = isDocker ? `${hostRootPrefix}${actualMount === '/' ? '' : actualMount}` : actualMount;

                // Check if path exists
                if (!existsSync(dfPath)) continue;

                const dfOutput = execSync(`df -B1 "${dfPath}" 2>/dev/null | tail -1`, { encoding: 'utf-8' });
                const dfParts = dfOutput.trim().split(/\s+/);

                if (dfParts.length >= 5) {
                    const total = parseInt(dfParts[1], 10) || 0;
                    const used = parseInt(dfParts[2], 10) || 0;
                    const available = parseInt(dfParts[3], 10) || 0;
                    const percentage = parseInt(dfParts[4].replace('%', ''), 10) || 0;

                    // Only add if we got valid data and it's not already in the list
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
                // Skip mounts we can't read
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
        // Try to get host filesystem info first (works in Docker with /host/proc mount)
        let fsData = await getHostFilesystemInfo();

        // If we couldn't get data from /proc/mounts, fall back to systeminformation
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

        const drives: DriveInfo[] = [];

        // Iterate through configured drives
        for (const configDrive of storageDrives) {
            // Try to find the mount point in system data
            const foundMount = fsData.find(d => d.mount === configDrive.mount);

            if (foundMount) {
                // Use actual system data
                drives.push({
                    id: configDrive.id,
                    name: configDrive.name,
                    label: configDrive.label,
                    mount: foundMount.mount,
                    total: foundMount.total,
                    used: foundMount.used,
                    available: foundMount.available,
                    percentage: foundMount.percentage,
                    icon: configDrive.icon.name || 'HardDrive',
                    found: true,
                });
            } else if (configDrive.fallback) {
                // Use fallback data if configured
                drives.push({
                    id: configDrive.id,
                    name: configDrive.name,
                    label: configDrive.label,
                    mount: configDrive.mount,
                    total: configDrive.fallback.total,
                    used: configDrive.fallback.used,
                    available: configDrive.fallback.total - configDrive.fallback.used,
                    percentage: configDrive.fallback.percentage,
                    icon: configDrive.icon.name || 'HardDrive',
                    found: false,
                });
            }
            // If no fallback and mount not found, skip this drive
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
