import { NextResponse } from 'next/server';
import si from 'systeminformation';

export async function GET() {
    try {
        const [cpu, mem, fs, temp, time] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.cpuTemperature(),
            si.time()
        ]);

        const rootFs = fs.find(drive => drive.mount === '/') || fs[0];

        // Calculate fan speed based on CPU temperature
        // Since direct fan data isn't available on all systems, we estimate based on temp
        const getFanSpeedLabel = (temperature: number): string => {
            if (temperature < 40) return 'Low';
            if (temperature < 60) return 'Mid';
            if (temperature < 80) return 'High';
            return 'Max';
        };

        // Get average CPU temperature
        const avgTemp = temp.cores.length > 0
            ? Math.round(temp.cores.reduce((a, b) => a + b, 0) / temp.cores.length)
            : temp.main;

        const fanSpeed = avgTemp > 0 ? getFanSpeedLabel(avgTemp) : 'Off';

        return NextResponse.json({
            cpu: Math.round(cpu.currentLoad),
            memory: {
                total: mem.total,
                used: mem.active,
                free: mem.available,
            },
            storage: {
                total: rootFs?.size || 0,
                used: rootFs?.used || 0,
                pcent: Math.round(rootFs?.use || 0),
            },
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
