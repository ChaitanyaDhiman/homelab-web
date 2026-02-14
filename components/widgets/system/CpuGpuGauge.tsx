
import { useEffect, useState } from 'react';
import { WidgetProps } from '@/types/widgets';
import { BaseWidget } from '@/components/widgets/BaseWidget';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useSystem } from '@/contexts/SystemContext';

export function CpuGpuGaugeWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { stats, loading } = useSystem();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const data = [
        {
            name: 'GPU',
            value: stats?.gpu?.utilization || 0,
            fill: '#8884d8', // Color for GPU
        },
        {
            name: 'CPU',
            value: stats?.cpu || 0,
            fill: '#82ca9d', // Color for CPU
        },
    ];

    // Recharts doesn't support multiple rings easily with RadialBar without tweaks,
    // but standard RadialBar with multiple data points creates multiple rings.
    // We want maximum 100.

    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="p-4"
        >
            <div className="h-full flex flex-col">
                <h3 className="text-white/70 text-xs font-medium mb-2 uppercase tracking-wider">
                    System Load
                </h3>

                <div className="flex-1 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            innerRadius="50%"
                            outerRadius="100%"
                            barSize={10}
                            data={data}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                background={{ fill: 'rgba(255,255,255,0.1)' }}
                                dataKey="value"
                                cornerRadius={10}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>

                    {/* Legend / Labels overlay */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#82ca9d]"></span>
                            <span className="text-white/70">CPU: {stats?.cpu ?? 0}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#8884d8]"></span>
                            <span className="text-white/70">GPU: {stats?.gpu?.utilization ?? 0}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}
