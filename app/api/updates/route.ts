import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Path to update status JSON from sidecar agent (Docker) or direct check (host)
const UPDATE_STATUS_FILE = '/data/update-status.json';

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

interface AgentStatus {
    upgrades: UpgradeInfo;
    reboot: { required: boolean; packages: string[] };
    lastUpdateCheck: string | null;
    agentTimestamp: string;
}

async function safeExec(command: string, fallback: string = ''): Promise<string> {
    try {
        const { stdout } = await execAsync(command);
        return stdout.trim();
    } catch {
        return fallback;
    }
}

/**
 * Read update status from the sidecar agent's JSON file (Docker mode)
 */
function readAgentStatus(): AgentStatus | null {
    try {
        if (!fs.existsSync(UPDATE_STATUS_FILE)) {
            return null;
        }
        const content = fs.readFileSync(UPDATE_STATUS_FILE, 'utf-8');
        return JSON.parse(content) as AgentStatus;
    } catch {
        return null;
    }
}

/**
 * Get upgrade info - uses agent file in Docker, direct apt-get on host
 */
async function getUpgradeInfo(): Promise<UpgradeInfo> {
    const isDocker = fs.existsSync('/.dockerenv');

    // In Docker, read from sidecar agent's JSON file
    if (isDocker) {
        const agentStatus = readAgentStatus();
        if (agentStatus) {
            return agentStatus.upgrades;
        }
        // Fallback if agent hasn't written yet
        return { total: 0, security: 0, allPackages: [], securityPackages: [] };
    }

    // On host, run apt-get directly
    try {
        await execAsync('apt-get update 2>/dev/null || true');
        const upgradeOutput = await safeExec(
            `apt-get upgrade --dry-run 2>/dev/null | grep "^Inst"`
        );

        if (!upgradeOutput) {
            return { total: 0, security: 0, allPackages: [], securityPackages: [] };
        }

        const lines = upgradeOutput.split('\n').filter(Boolean);
        const allPackages: string[] = [];
        const securityPackages: string[] = [];

        for (const line of lines) {
            const match = line.match(/^Inst\s+(\S+)/);
            if (match) {
                const packageName = match[1];
                allPackages.push(packageName);

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

/**
 * Check if reboot is required - uses agent file in Docker, direct check on host
 */
async function checkRebootRequired(): Promise<{ required: boolean; packages: string[] }> {
    const isDocker = fs.existsSync('/.dockerenv');

    // In Docker, read from sidecar agent's JSON file
    if (isDocker) {
        const agentStatus = readAgentStatus();
        if (agentStatus) {
            return agentStatus.reboot;
        }
        // Also check mounted /host/var/run as fallback
        const rebootFile = '/host/var/run/reboot-required';
        const rebootPkgsFile = '/host/var/run/reboot-required.pkgs';

        try {
            if (!fs.existsSync(rebootFile)) {
                return { required: false, packages: [] };
            }
            const packagesContent = await safeExec(`cat ${rebootPkgsFile} 2>/dev/null`);
            return {
                required: true,
                packages: packagesContent.split('\n').filter(Boolean),
            };
        } catch {
            return { required: false, packages: [] };
        }
    }

    // On host, check directly
    const rebootFile = '/var/run/reboot-required';
    const rebootPkgsFile = '/var/run/reboot-required.pkgs';

    try {
        if (!fs.existsSync(rebootFile) || !fs.statSync(rebootFile).isFile()) {
            return { required: false, packages: [] };
        }
    } catch {
        return { required: false, packages: [] };
    }

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

/**
 * Get last update log entries
 */
async function getLastUpdateLog(): Promise<string[]> {
    const logs: string[] = [];
    const isDocker = fs.existsSync('/.dockerenv');

    // In Docker, we can show agent timestamp
    if (isDocker) {
        const agentStatus = readAgentStatus();
        if (agentStatus?.agentTimestamp) {
            logs.push('=== Update Agent Status ===');
            logs.push(`Last check: ${agentStatus.agentTimestamp}`);
        }
    }

    return logs.length > 0 ? logs : ['No update logs available'];
}

/**
 * Get the timestamp of last update check
 */
async function getLastUpdateTime(): Promise<string | null> {
    const isDocker = fs.existsSync('/.dockerenv');

    if (isDocker) {
        const agentStatus = readAgentStatus();
        return agentStatus?.lastUpdateCheck || null;
    }

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
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}