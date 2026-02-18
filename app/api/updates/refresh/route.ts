import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

// Trigger file path - same location as update-agent uses
const TRIGGER_FILE = '/data/trigger-refresh';

/**
 * POST /api/updates/refresh
 * Triggers an immense update check.
 * - Docker: Creates a trigger file for the sidecar agent.
 * - Host: Runs `apt-get update` directly.
 */
export async function POST() {
    const isDocker = fs.existsSync('/.dockerenv');

    try {
        if (!isDocker) {
            // On host, try to run apt-get update directly
            // Try with sudo first, then without if that fails (though without usually fails for update)
            // This might take time (10-30s), so we await it.
            try {
                // Try sudo non-interactive first
                try {
                    await execAsync('sudo -n apt-get update');
                } catch (sudoError) {
                    // Fallback to normal command if sudo fails or not available
                    // This will likely fail with permission denied, but let's try
                    console.log('sudo apt-get update failed, trying without sudo:', sudoError);
                    await execAsync('apt-get update');
                }

                return NextResponse.json({
                    success: true,
                    message: 'Package list updated successfully',
                    timestamp: new Date().toISOString(),
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error('Failed to update package list:', error);

                const isPermissionError = error.message.includes('Permission denied') || error.message.includes('E: Could not open lock file');

                return NextResponse.json({
                    success: false,
                    error: isPermissionError
                        ? 'Permission denied. Please configure passwordless sudo for apt-get update: "username ALL=(ALL) NOPASSWD: /usr/bin/apt-get update"'
                        : 'Failed to update package list: ' + error.message,
                    timestamp: new Date().toISOString(),
                }, { status: isPermissionError ? 403 : 500 });
            }
        }

        // Docker Mode
        const triggerDir = path.dirname(TRIGGER_FILE);

        if (!fs.existsSync(triggerDir)) {
            fs.mkdirSync(triggerDir, { recursive: true });
        }

        fs.writeFileSync(TRIGGER_FILE, new Date().toISOString());

        return NextResponse.json({
            success: true,
            message: 'Refresh triggered - update check will run within seconds',
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                message: 'Failed to trigger refresh',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
