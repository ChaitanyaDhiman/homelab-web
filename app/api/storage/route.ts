import { NextResponse } from 'next/server';
import si from 'systeminformation';
import { storageDrives } from '@/app/config/storage';

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

export async function GET() {
    try {
        const fsData = await si.fsSize();

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
                    total: foundMount.size,
                    used: foundMount.used,
                    available: foundMount.available,
                    percentage: Math.round(foundMount.use),
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
