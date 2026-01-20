import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Trigger file path - same location as update-agent uses
const TRIGGER_FILE = '/data/trigger-refresh';

/**
 * POST /api/updates/refresh
 * Triggers an immediate update check by creating a trigger file
 * that the update-agent watches for.
 */
export async function POST() {
    const isDocker = fs.existsSync('/.dockerenv');

    if (!isDocker) {
        // On host, we don't use the agent - just return success
        // The main /api/updates endpoint will run apt-get directly
        return NextResponse.json({
            success: true,
            message: 'Running on host - updates checked directly',
            timestamp: new Date().toISOString(),
        });
    }

    try {
        // Create the trigger file - agent will detect and run update check
        const triggerDir = path.dirname(TRIGGER_FILE);

        // Ensure directory exists
        if (!fs.existsSync(triggerDir)) {
            fs.mkdirSync(triggerDir, { recursive: true });
        }

        // Write trigger file with timestamp
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
