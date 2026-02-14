
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
        // Fetch container list (for static info + health/status)
        // json . format: ID, Names, Image, Status, State, CreatedAt
        // Health is usually part of Status "Up 2 hours (healthy)" or in .Status field
        // But better to check.
        // docker ps format {{json .}} gives:
        // {"Command":"...","CreatedAt":"...","ID":"...","Image":"...","Labels":"...","LocalVolumes":"...","Mounts":"...","Names":"...","Networks":"...","Ports":"...","RunningFor":"...","Size":"...","State":"...","Status":"..."}
        // Status string usually contains "(healthy)" if healthcheck exists.

        const psCmd = 'docker ps --all --format "{{json .}}"';
        const { stdout: psOutput } = await execAsync(psCmd);

        const containers: Map<string, Partial<ContainerInfo>> = new Map();

        if (psOutput) {
            const lines = psOutput.trim().split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const c = JSON.parse(line);
                    containers.set(c.ID, {
                        id: c.ID,
                        name: c.Names,
                        image: c.Image,
                        status: c.Status, // "Up 2 hours (healthy)"
                        state: c.State,   // "running"
                        created: c.CreatedAt,
                        // Extract healthy status from status string if present
                        health: c.Status.includes('(healthy)') ? 'healthy' :
                            c.Status.includes('(unhealthy)') ? 'unhealthy' :
                                c.Status.includes('(health: starting)') ? 'starting' : 'unknown'
                    });
                } catch (e) {
                    console.error('Error parsing docker ps line:', e);
                }
            }
        }

        // Fetch stats (for metrics) - only running containers
        // docker stats --no-stream --format "{{json .}}"
        const statsCmd = 'docker stats --no-stream --format "{{json .}}"';
        try {
            const { stdout: statsOutput } = await execAsync(statsCmd);

            if (statsOutput) {
                const lines = statsOutput.trim().split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const s = JSON.parse(line);
                        // s = {"BlockIO":"...","CPUPerc":"...","Container":"...","ID":"...","MemPerc":"...","MemUsage":"...","Name":"...","NetIO":"...","PIDs":"..."}

                        const container = containers.get(s.ID) || containers.get(s.Container); // ID might be short or long?

                        // Try to find by partial ID match if not found direct
                        let targetContainer = container;
                        if (!targetContainer) {
                            for (const [id, c] of containers) {
                                if (id.startsWith(s.ID) || s.ID.startsWith(id)) {
                                    targetContainer = c;
                                    break;
                                }
                            }
                        }

                        if (targetContainer) {
                            targetContainer.cpu = s.CPUPerc;
                            targetContainer.memory = s.MemUsage.split('/')[0].trim(); // Take usage
                            targetContainer.memoryLimit = s.MemUsage.split('/')[1]?.trim();
                            targetContainer.netIO = s.NetIO;
                            targetContainer.blockIO = s.BlockIO;
                            targetContainer.pids = s.PIDs;
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
