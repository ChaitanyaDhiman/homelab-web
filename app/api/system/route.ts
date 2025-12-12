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
            temperature: temp.main,
            uptime: time.uptime,
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system stats' },
            { status: 500 }
        );
    }
}
