import { NextResponse } from 'next/server';
import si from 'systeminformation';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function GET() {
    try {
        // Optimize: Fetch only essential data from systeminformation
        const [cpu, mem, time, netStats, netInterfaces] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.time(),
            si.networkStats('*'),
            si.networkInterfaces(),
        ]);

        // Filter for non-internal, operational interfaces
        const validInterfaces = new Set(
            (Array.isArray(netInterfaces) ? netInterfaces : [netInterfaces])
                .filter(iface => !iface.internal && iface.operstate === 'up')
                .map(iface => iface.iface)
        );

        // Sum up network stats from valid interfaces
        const totalRxSec = netStats.reduce((acc, iface) => acc + (validInterfaces.has(iface.iface) ? iface.rx_sec : 0), 0);
        const totalTxSec = netStats.reduce((acc, iface) => acc + (validInterfaces.has(iface.iface) ? iface.tx_sec : 0), 0);

        // Get temperature and fan speed from sensors command
        let fanSpeed = 'Off';
        let avgTemp = 0;
        const cpuCoreTemps: number[] = [];

        try {
            // Unsafe: await execAsync('sensors'); 
            // Safe: use execFile which does not spawn a shell
            const { stdout: sensorsOutput } = await execFileAsync('sensors', []);

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

            // Parse fan speed
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
                // Fallback: estimate fan speed from temperature
                if (avgTemp < 45) fanSpeed = 'Off';
                else if (avgTemp < 60) fanSpeed = 'Low';
                else if (avgTemp < 75) fanSpeed = 'Mid';
                else if (avgTemp < 80) fanSpeed = 'High';
                else fanSpeed = 'Max';
            }
        } catch (sensorError) {
            console.error('Failed to read from sensors command:', sensorError);
            // Fallback to systeminformation for temperature
            try {
                const temp = await si.cpuTemperature();
                avgTemp = temp.cores.length > 0
                    ? Math.round(temp.cores.reduce((a, b) => a + b, 0) / temp.cores.length)
                    : temp.main;
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
            // Safer execution with args array logic
            const { stdout } = await execFileAsync('nvidia-smi', [
                '--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu',
                '--format=csv,noheader,nounits'
            ]);

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
        } catch {
            // Ignore nvidia errors
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
            network: {
                rx_sec: totalRxSec,
                tx_sec: totalTxSec,
            },
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system stats' },
            { status: 500 }
        );
    }
}
