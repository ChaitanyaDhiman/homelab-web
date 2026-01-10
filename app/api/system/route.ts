import { NextResponse } from 'next/server';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        const [cpu, mem, temp, time] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.cpuTemperature(),
            si.time()
        ]);

        // Calculate fan speed based on CPU temperature
        // Since direct fan data isn't available on all systems, we estimate based on temp
        const getFanSpeedLabel = (temperature: number): string => {
            if (temperature < 45) return 'Off';
            if (temperature < 60) return 'Low';
            if (temperature < 75) return 'Mid';
            if (temperature < 80) return 'High';
            return 'Max';
        };

        // Get average CPU temperature
        const avgTemp = temp.cores.length > 0
            ? Math.round(temp.cores.reduce((a, b) => a + b, 0) / temp.cores.length)
            : temp.main;

        const fanSpeed = avgTemp > 0 ? getFanSpeedLabel(avgTemp) : 'Off';

        // Get GPU info using nvidia-smi for accurate data
        let gpuData = {
            name: 'N/A',
            utilization: 0,
            memory: 0,
            memoryTotal: 0,
            temperature: 0,
        };

        try {
            // Try nvidia-smi first for Nvidia GPUs
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
            // nvidia-smi not available, try systeminformation as fallback
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
