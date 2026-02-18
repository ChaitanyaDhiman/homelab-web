import { NextResponse } from 'next/server';
import { loadAppsConfig, saveAppsConfig } from '@/app/lib/appsConfig';
import { AppsConfig } from '@/app/types/apps';

export async function GET() {
    try {
        const config = loadAppsConfig();
        return NextResponse.json(config);
    } catch (error) {
        console.error('Error in GET /api/apps:', error);
        return NextResponse.json(
            { error: 'Failed to load apps configuration' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const config: AppsConfig = await request.json();

        // Basic validation
        if (!config.categories || !Array.isArray(config.categories)) {
            return NextResponse.json(
                { error: 'Invalid configuration format' },
                { status: 400 }
            );
        }

        saveAppsConfig(config);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in POST /api/apps:', error);
        return NextResponse.json(
            { error: 'Failed to save apps configuration' },
            { status: 500 }
        );
    }
}
