import { NextResponse } from 'next/server';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        // Optimize: Fetch only essential data from systeminformation
        const [cpu, mem, time] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.time()
        ]);

        // Get temperature and fan speed from sensors command (single call for both)
        let fanSpeed = 'Off';
        let avgTemp = 0;
        let cpuCoreTemps: number[] = [];

        try {
            const { stdout: sensorsOutput } = await execAsync('sensors');

            // Parse CPU core temperatures
            const coreMatches = sensorsOutput.matchAll(/Core\s+\d+:\s+\+?(\d+(?:\.\d+)?)/gi);
            for (const match of coreMatches) {
                const temp = parseFloat(match[1]);
                if (!isNaN(temp)) {
                    cpuCoreTemps.push(temp);
                }
            }

            // Calculate average temperature from cores
            if (cpuCoreTemps.length > 0) {
                avgTemp = Math.round(cpuCoreTemps.reduce((a, b) => a + b, 0) / cpuCoreTemps.length);
            } else {
                // Fallback: try to get Package/CPU temperature
                const packageMatch = sensorsOutput.match(/(?:Package id 0|CPU):\s+\+?(\d+(?:\.\d+)?)/i);
                if (packageMatch) {
                    avgTemp = Math.round(parseFloat(packageMatch[1]));
                }
            }

            // Parse fan speed from dell_smm or other adapters
            const fanMatch = sensorsOutput.match(/(?:Processor Fan|Video Fan|CPU Fan|System Fan):\s*(\d+)\s*RPM/i);

            if (fanMatch) {
                const rpm = parseInt(fanMatch[1]);

                // Determine fan speed label based on RPM
                if (rpm === 0) {
                    fanSpeed = 'Off';
                } else if (rpm < 2000) {
                    fanSpeed = 'Low';
                } else if (rpm < 3500) {
                    fanSpeed = 'Mid';
                } else if (rpm < 4500) {
                    fanSpeed = 'High';
                } else {
                    fanSpeed = 'Max';
                }
            } else if (avgTemp > 0) {
                // Fallback: estimate fan speed from temperature if RPM not available
                if (avgTemp < 45) fanSpeed = 'Off';
                else if (avgTemp < 60) fanSpeed = 'Low';
                else if (avgTemp < 75) fanSpeed = 'Mid';
                else if (avgTemp < 80) fanSpeed = 'High';
                else fanSpeed = 'Max';
            }
        } catch (sensorError) {
            console.error('Failed to read from sensors command:', sensorError);
            // Fallback to systeminformation for temperature only
            try {
                const temp = await si.cpuTemperature();
                avgTemp = temp.cores.length > 0
                    ? Math.round(temp.cores.reduce((a, b) => a + b, 0) / temp.cores.length)
                    : temp.main;

                // Estimate fan speed from temperature
                if (avgTemp < 45) fanSpeed = 'Off';
                else if (avgTemp < 60) fanSpeed = 'Low';
                else if (avgTemp < 75) fanSpeed = 'Mid';
                else if (avgTemp < 80) fanSpeed = 'High';
                else fanSpeed = 'Max';
            } catch (tempError) {
                console.error('Failed to read temperature:', tempError);
            }
        }

        let gpuData = {
            name: 'N/A',
            utilization: 0,
            memory: 0,
            memoryTotal: 0,
            temperature: 0,
        };

        try {
            const { stdout } = await execAsync(
                'nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits'
            );

            if (stdout) {
                const parts = stdout.trim().split(',').map(s => s.trim());
                if (parts.length >= 5) {
                    gpuData = {
                        name: parts[0],
                        utilization: parseInt(parts[1]) || 0,
                        memory: parseInt(parts[2]) || 0,
                        memoryTotal: parseInt(parts[3]) || 0,
                        temperature: parseInt(parts[4]) || 0,
                    };
                }
            }
        } catch (nvidiaError) {
            try {
                const graphics = await si.graphics();
                const gpuController = graphics.controllers.find(gpu =>
                    gpu.vendor?.toLowerCase().includes('nvidia')
                ) || graphics.controllers[0];

                if (gpuController) {
                    gpuData = {
                        name: gpuController.model || 'N/A',
                        utilization: gpuController.utilizationGpu || 0,
                        memory: gpuController.memoryUsed || 0,
                        memoryTotal: gpuController.memoryTotal || 0,
                        temperature: gpuController.temperatureGpu || 0,
                    };
                }
            } catch (siError) {
                console.error('GPU detection failed:', siError);
            }
        }

        return NextResponse.json({
            cpu: Math.round(cpu.currentLoad),
            memory: {
                total: mem.total,
                used: mem.active,
                free: mem.available,
            },
            gpu: gpuData,
            temperature: avgTemp,
            uptime: time.uptime,
            fanSpeed,
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system stats' },
            { status: 500 }
        );
    }
}
