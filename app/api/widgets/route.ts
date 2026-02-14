import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'app/config/widgets.json');
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), 'app/config/default.json');

async function getWidgetsConfig() {
    // If widgets.json exists, use it
    if (existsSync(CONFIG_PATH)) {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
    }

    // Fall back to default.json → widgets section
    if (existsSync(DEFAULT_CONFIG_PATH)) {
        const data = await fs.readFile(DEFAULT_CONFIG_PATH, 'utf-8');
        const defaults = JSON.parse(data);
        if (defaults.widgets) {
            return defaults.widgets; // { widgets: [...] }
        }
    }

    // Ultimate fallback
    return { widgets: [] };
}

export async function GET() {
    try {
        const config = await getWidgetsConfig();
        return NextResponse.json(config);
    } catch (error) {
        console.error('Error reading widget config:', error);
        return NextResponse.json({ widgets: [] });
    }
}

export async function POST(request: Request) {
    try {
        const config = await request.json();

        // Validate config structure
        if (!config.widgets || !Array.isArray(config.widgets)) {
            return NextResponse.json(
                { error: 'Invalid configuration format' },
                { status: 400 }
            );
        }

        // Always write to widgets.json (never to default.json)
        await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving widget config:', error);
        return NextResponse.json(
            { error: 'Failed to save configuration' },
            { status: 500 }
        );
    }
}
