
import { useEffect, useState } from 'react';
import { WidgetProps } from '@/app/types/widgets';
import { BaseWidget } from '@/app/components/widgets/BaseWidget';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useSystem } from '@/app/contexts/SystemContext';

export function CpuGpuGaugeWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { stats, loading } = useSystem();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Skeleton Loading
    if (loading) {
        return (
            <BaseWidget
                isEditMode={isEditMode}
                onRemove={onRemove}
                className="p-4"
            >
                <div className="h-full flex flex-col">
                    <div className="h-4 bg-white/10 rounded w-24 mb-4 animate-pulse" />
                    <div className="flex-1 relative flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white/10 animate-pulse" />
                    </div>
                </div>
            </BaseWidget>
        );
    }

    const data = [
        {
            name: 'GPU',
            value: stats?.gpu?.utilization || 0,
            fill: '#8884d8', // Will be overridden by style or gradient if possible, but Recharts radial bar checks fill
        },
        {
            name: 'CPU',
            value: stats?.cpu || 0,
            fill: '#82ca9d',
        },
    ];

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
                            barSize={12}
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
                                background={{ fill: 'rgba(255,255,255,0.05)' }}
                                dataKey="value"
                                cornerRadius={12}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>

                    {/* Legend / Labels overlay */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <div className="flex items-center gap-2 text-xs mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#82ca9d] shadow-[0_0_8px_rgba(130,202,157,0.5)]"></span>
                            <span className="text-white/90 font-medium">CPU: {stats?.cpu ?? 0}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#8884d8] shadow-[0_0_8px_rgba(136,132,216,0.5)]"></span>
                            <span className="text-white/90 font-medium">GPU: {stats?.gpu?.utilization ?? 0}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}
