import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const dynamic = 'force-dynamic';

interface ContainerInfo {
    id: string;
    name: string;
    image: string;
    status: string;
    state: string; // running, exited, etc.
    created: string;
    health: string;

    // Stats
    cpu: string;
    memory: string;
    memoryLimit: string;
    netIO: string;
    blockIO: string;
    pids: string;
}

export async function GET() {
    try {
        // 1. Fetch container list (for static info + health/status)
        // Safer: execFile('docker', ['ps', ...])
        const { stdout: psOutput } = await execFileAsync('docker', [
            'ps',
            '--all',
            '--format',
            '{{json .}}'
        ]);

        const containers: Map<string, Partial<ContainerInfo>> = new Map();
        // Index by short ID as well for faster matching
        const shortIdIndex: Map<string, string> = new Map();

        if (psOutput) {
            const lines = psOutput.trim().split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const c = JSON.parse(line);
                    const containerData = {
                        id: c.ID,
                        name: c.Names,
                        image: c.Image,
                        status: c.Status,
                        state: c.State,
                        created: c.CreatedAt,
                        health: c.Status.includes('(healthy)') ? 'healthy' :
                            c.Status.includes('(unhealthy)') ? 'unhealthy' :
                                c.Status.includes('(health: starting)') ? 'starting' : 'unknown'
                    };
                    containers.set(c.ID, containerData);
                    // Match standard 12-char ID or whatever docker uses
                    shortIdIndex.set(c.ID.substring(0, 12), c.ID);
                } catch (e) {
                    console.error('Error parsing docker ps line:', e);
                }
            }
        }

        // 2. Fetch stats (for metrics) - only running containers
        try {
            const { stdout: statsOutput } = await execFileAsync('docker', [
                'stats',
                '--no-stream',
                '--format',
                '{{json .}}'
            ]);

            if (statsOutput) {
                const lines = statsOutput.trim().split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const s = JSON.parse(line);
                        // s = {"BlockIO":"...","CPUPerc":"...","Container":"...","ID":"...","MemPerc":"...","MemUsage":"...","Name":"...","NetIO":"...","PIDs":"..."}

                        // Optimization: O(1) Lookup
                        // Try Full ID -> Try Short ID Index -> Fail
                        let targetId = containers.has(s.ID) ? s.ID : shortIdIndex.get(s.ID);

                        if (!targetId && s.Container) {
                            // Sometimes ID is name?
                            // Fallback to name match only if needed?
                            // But s.ID is usually the ID.
                            targetId = containers.has(s.Container) ? s.Container : shortIdIndex.get(s.Container);
                        }

                        if (targetId) {
                            const container = containers.get(targetId);
                            if (container) {
                                container.cpu = s.CPUPerc;
                                container.memory = s.MemUsage.split('/')[0].trim();
                                container.memoryLimit = s.MemUsage.split('/')[1]?.trim();
                                container.netIO = s.NetIO;
                                container.blockIO = s.BlockIO;
                                container.pids = s.PIDs;
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing docker stats line:', e);
                    }
                }
            }
        } catch (statsError) {
            console.error('Error fetching docker stats (might be no running containers):', statsError);
        }

        // Convert map values to array
        const result = Array.from(containers.values());

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Error fetching docker info:', error);
        return NextResponse.json(
            { error: 'Failed to fetch docker info' },
            { status: 500 }
        );
    }
}
