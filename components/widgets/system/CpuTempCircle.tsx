
import { useEffect, useState } from 'react';
import { WidgetProps } from '@/types/widgets';
import { BaseWidget } from '@/components/widgets/BaseWidget';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useSystem } from '@/contexts/SystemContext';

export function CpuTempWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { stats, loading } = useSystem();
    const [history, setHistory] = useState<{ value: number }[]>([]);

    useEffect(() => {
        if (stats) {
            setHistory(prev => {
                const newData = [...prev, { value: stats.cpu }];
                if (newData.length > 20) newData.shift();
                return newData;
            });
        }
    }, [stats]);

    const cpu = stats?.cpu || 0;
    const temp = stats?.temperature || 0;

    // Calculate circumference for circle
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (cpu / 100) * circumference;

    // Color based on load
    const color = cpu > 80 ? '#ef4444' : cpu > 50 ? '#eab308' : '#3b82f6';

    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="p-4"
        >
            <div className="h-full flex flex-col items-center">
                <h3 className="text-white/70 text-xs font-medium mb-2 uppercase tracking-wider self-start w-full flex justify-between">
                    <span>CPU</span>
                    <span>{temp}°C</span>
                </h3>

                <div className="flex-1 w-full relative flex items-center justify-center">
                    {/* Circular Progress */}
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-white/10"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke={color}
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-500 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">{cpu}%</span>
                        </div>
                    </div>

                    {/* Sparkline in background or bottom? User asked for "Circular meter ... with CPU Utilzation graph" */}
                    {/* Can't easily fit graph inside circle nicely if text is there. */}
                    {/* Let's put graph at bottom or behind? */}
                    {/* Or create a composite widget. */}
                    {/* I'll overlay a small faint graph in the background or at bottom. */}
                </div>

                {/* Sparkline at bottom */}
                <div className="h-8 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />
                            <YAxis domain={[0, 100]} hide />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </BaseWidget>
    );
}
