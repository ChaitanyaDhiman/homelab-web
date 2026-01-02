import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface UpdateStatus {
    rebootRequired: boolean;
    rebootReasons: string[];
    lastUpdateCheck: string | null;
    updatesAvailable: number;
    securityUpdates: number;
    lastUpdateLog: string[];
    updatePackages: string[];
    securityPackagesList: string[];
}

async function getUpdatePackages(): Promise<string[]> {
    try {
        const { stdout } = await execAsync(
            'apt list --upgradable 2>/dev/null | grep -v "Listing" | cut -d "/" -f 1'
        );
        return stdout.trim().split('\n').filter(Boolean);
    } catch {
        return [];
    }
}

async function getSecurityPackages(): Promise<string[]> {
    try {
        const { stdout } = await execAsync(
            'apt list --upgradable 2>/dev/null | grep -i security | cut -d "/" -f 1'
        );
        return stdout.trim().split('\n').filter(Boolean);
    } catch {
        return [];
    }
}

async function checkRebootRequired(): Promise<{ required: boolean; packages: string[] }> {
    try {
        const { stdout: rebootCheck } = await execAsync('[ -f /var/run/reboot-required ] && echo "yes" || echo "no"');
        const required = rebootCheck.trim() === 'yes';

        if (required) {
            try {
                const { stdout: packages } = await execAsync('cat /var/run/reboot-required.pkgs 2>/dev/null || echo ""');
                return {
                    required: true,
                    packages: packages.trim().split('\n').filter(Boolean),
                };
            } catch {
                return { required: true, packages: [] };
            }
        }

        return { required: false, packages: [] };
    } catch {
        return { required: false, packages: [] };
    }
}

async function getUpdateStats(): Promise<{ total: number; security: number }> {
    try {
        // Check if running inside Docker
        const isDocker = fs.existsSync('/.dockerenv');

        // Check for available updates - Skip update if in Docker to avoid write errors on read-only mount
        if (!isDocker) {
            await execAsync('apt-get update 2>/dev/null || true');
        }

        const { stdout: updates } = await execAsync('apt list --upgradable 2>/dev/null | grep -v "Listing" | wc -l');
        const { stdout: security } = await execAsync('apt list --upgradable 2>/dev/null | grep -i security | wc -l');

        return {
            total: parseInt(updates.trim()) || 0,
            security: parseInt(security.trim()) || 0,
        };
    } catch {
        return { total: 0, security: 0 };
    }
}

async function getLastUpdateLog(): Promise<string[]> {
    try {
        const { stdout } = await execAsync(
            'tail -n 20 /var/log/unattended-upgrades/unattended-upgrades.log 2>/dev/null | grep "INFO" || echo "No logs available"'
        );
        return stdout.trim().split('\n').filter(Boolean);
    } catch {
        return ['Update logs not available'];
    }
}

async function getLastUpdateTime(): Promise<string | null> {
    try {
        const { stdout } = await execAsync(
            'stat -c %y /var/log/unattended-upgrades/unattended-upgrades.log 2>/dev/null || echo ""'
        );
        return stdout.trim() || null;
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const [rebootStatus, updateStats, lastLog, lastUpdate, updatePackages, securityPackages] = await Promise.all([
            checkRebootRequired(),
            getUpdateStats(),
            getLastUpdateLog(),
            getLastUpdateTime(),
            getUpdatePackages(),
            getSecurityPackages(),
        ]);

        const response: UpdateStatus = {
            rebootRequired: rebootStatus.required,
            rebootReasons: rebootStatus.packages,
            lastUpdateCheck: lastUpdate,
            updatesAvailable: updateStats.total,
            securityUpdates: updateStats.security,
            lastUpdateLog: lastLog,
            updatePackages: updatePackages,
            securityPackagesList: securityPackages,
        };

        return NextResponse.json({
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
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