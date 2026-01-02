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

interface UpgradeInfo {
    total: number;
    security: number;
    allPackages: string[];
    securityPackages: string[];
}

// Helper function to safely execute commands and parse output
async function safeExec(command: string, fallback: string = ''): Promise<string> {
    try {
        const { stdout } = await execAsync(command);
        return stdout.trim();
    } catch {
        return fallback;
    }
}

async function getUpgradeInfo(): Promise<UpgradeInfo> {
    try {
        // Check if running inside Docker
        const isDocker = fs.existsSync('/.dockerenv');

        if (!isDocker) {
            // On host, update the package lists
            await execAsync('apt-get update 2>/dev/null || true');
        }

        // Single call to apt-get upgrade --dry-run
        const upgradeOutput = await safeExec(
            'apt-get upgrade --dry-run 2>/dev/null | grep "^Inst"'
        );

        if (!upgradeOutput) {
            return { total: 0, security: 0, allPackages: [], securityPackages: [] };
        }

        const lines = upgradeOutput.split('\n').filter(Boolean);
        const allPackages: string[] = [];
        const securityPackages: string[] = [];

        for (const line of lines) {
            // Extract package name (second field in "Inst package_name ...")
            const match = line.match(/^Inst\s+(\S+)/);
            if (match) {
                const packageName = match[1];
                allPackages.push(packageName);

                // Check if it's a security update
                if (line.toLowerCase().includes('security')) {
                    securityPackages.push(packageName);
                }
            }
        }

        return {
            total: allPackages.length,
            security: securityPackages.length,
            allPackages,
            securityPackages,
        };
    } catch {
        return { total: 0, security: 0, allPackages: [], securityPackages: [] };
    }
}

async function checkRebootRequired(): Promise<{ required: boolean; packages: string[] }> {
    const rebootFile = '/var/run/reboot-required';
    const rebootPkgsFile = '/var/run/reboot-required.pkgs';

    // Check if reboot-required exists and is a file (not a directory)
    try {
        const stat = fs.statSync(rebootFile);
        if (!stat.isFile()) {
            return { required: false, packages: [] };
        }
    } catch {
        // File doesn't exist
        return { required: false, packages: [] };
    }

    // Reboot is required, try to get the package list
    try {
        const packagesContent = await safeExec(`cat ${rebootPkgsFile} 2>/dev/null`);
        return {
            required: true,
            packages: packagesContent.split('\n').filter(Boolean),
        };
    } catch {
        return { required: true, packages: [] };
    }
}

async function getLastUpdateLog(): Promise<string[]> {
    const logs: string[] = [];

    const [aptHistory, unattendedLogs, dpkgLogs] = await Promise.all([
        safeExec('grep -h "Commandline:" /var/log/apt/history.log 2>/dev/null | tail -n 5'),
        safeExec('tail -n 10 /var/log/unattended-upgrades/unattended-upgrades.log 2>/dev/null | grep -E "INFO|WARNING|ERROR"'),
        safeExec('grep -E "status (installed|upgraded|removed)" /var/log/dpkg.log 2>/dev/null | tail -n 5'),
    ]);

    if (aptHistory) {
        logs.push('=== System APT Operations ===');
        logs.push(...aptHistory.split('\n').filter(Boolean));
    }

    if (unattendedLogs) {
        if (logs.length > 0) logs.push('');
        logs.push('=== Unattended Upgrades ===');
        logs.push(...unattendedLogs.split('\n').filter(Boolean));
    }

    if (dpkgLogs) {
        if (logs.length > 0) logs.push('');
        logs.push('=== Recent Package Operations ===');
        logs.push(...dpkgLogs.split('\n').filter(Boolean));
    }

    return logs.length > 0 ? logs : ['No update logs available'];
}

async function getLastUpdateTime(): Promise<string | null> {
    // Check multiple possible timestamps for when apt update was last run
    const timestamp = await safeExec(
        'stat -c %y /var/lib/apt/periodic/update-success-stamp 2>/dev/null || ' +
        'stat -c %y /var/cache/apt/pkgcache.bin 2>/dev/null || ' +
        'stat -c %y /var/lib/apt/lists 2>/dev/null'
    );
    return timestamp || null;
}

export async function GET() {
    try {
        const [rebootStatus, upgradeInfo, lastLog, lastUpdate] = await Promise.all([
            checkRebootRequired(),
            getUpgradeInfo(),
            getLastUpdateLog(),
            getLastUpdateTime(),
        ]);

        const response: UpdateStatus = {
            rebootRequired: rebootStatus.required,
            rebootReasons: rebootStatus.packages,
            lastUpdateCheck: lastUpdate,
            updatesAvailable: upgradeInfo.total,
            securityUpdates: upgradeInfo.security,
            lastUpdateLog: lastLog,
            updatePackages: upgradeInfo.allPackages,
            securityPackagesList: upgradeInfo.securityPackages,
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