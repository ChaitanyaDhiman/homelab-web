
import { useEffect, useState } from 'react';
import { WidgetProps } from '@/app/types/widgets';
import { BaseWidget } from '@/app/components/widgets/BaseWidget';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { useSystem } from '@/app/contexts/SystemContext';

export function GpuTempWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { stats, loading } = useSystem();
    const [history, setHistory] = useState<{ value: number }[]>([]);

    useEffect(() => {
        if (stats) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHistory(prev => {
                const newData = [...prev, { value: stats.gpu?.utilization || 0 }];
                if (newData.length > 20) newData.shift();
                return newData;
            });
        }
    }, [stats]);

    // Skeleton Loading
    if (loading) {
        return (
            <BaseWidget isEditMode={isEditMode} onRemove={onRemove} className="p-4">
                <div className="h-full flex flex-col items-center">
                    <div className="w-full flex justify-between mb-2">
                        <div className="h-3 w-8 bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-8 bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="flex-1 w-full flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white/10 animate-pulse" />
                    </div>
                    <div className="h-8 w-full mt-2 bg-white/5 rounded animate-pulse" />
                </div>
            </BaseWidget>
        );
    }

    const gpu = stats?.gpu?.utilization || 0;
    const temp = stats?.gpu?.temperature || 0;
    const memoryUsed = stats?.gpu?.memory || 0;

    // Calculate circumference for circle
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (gpu / 100) * circumference;

    // Unique IDs for gradients
    const gradientId = `gpu-temp-gradient-${widget.id}`;
    const fillGradientId = `gpu-area-gradient-${widget.id}`;

    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="p-4"
        >
            <div className="h-full flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-2">
                    <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider">GPU</h3>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${temp > 80 ? 'bg-red-500/20 text-red-400' :
                        temp > 60 ? 'bg-purple-500/20 text-purple-400' :
                            'bg-indigo-500/20 text-indigo-400'
                        }`}>
                        {temp}°C
                    </span>
                </div>

                <div className="flex-1 w-full relative flex items-center justify-center">
                    {/* Circular Progress */}
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <defs>
                                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="50%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-white/5"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke={`url(#${gradientId})`}
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-500 ease-out shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-bold text-white tracking-tight">{gpu}%</span>
                            {memoryUsed > 0 && (
                                <span className="text-[10px] text-white/40">{Math.round(memoryUsed / 1024)}GB</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Area Chart at bottom */}
                <div className="h-12 w-full -mb-1 -mt-2 opacity-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#${fillGradientId})`}
                                isAnimationActive={false}
                            />
                            <YAxis domain={[0, 100]} hide />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </BaseWidget>
    );
}
