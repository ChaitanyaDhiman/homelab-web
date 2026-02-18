
import { WidgetProps } from '@/app/types/widgets';
import { BaseWidget } from '@/app/components/widgets/BaseWidget';
import { useStorage } from '@/app/hooks/useStorage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function StoragePieWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { data, loading } = useStorage();

    const totalBytes = data?.drives.reduce((acc, d) => acc + d.total, 0) || 0;
    const usedBytes = data?.drives.reduce((acc, d) => acc + d.used, 0) || 0;
    const freeBytes = totalBytes - usedBytes;

    const chartData = [
        { name: 'Used', value: usedBytes },
        { name: 'Free', value: freeBytes },
    ];

    const COLORS = ['#ef4444', '#10b981']; // Red for used, Green for free

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="p-4"
        >
            <div className="h-full flex flex-col">
                <h3 className="text-xs font-medium text-white/70 uppercase tracking-wider mb-2">
                    Storage Usage
                </h3>

                <div className="flex-1 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => formatBytes(value)}
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">
                                {totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0}%
                            </div>
                            <div className="text-[10px] text-white/50">Used</div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between px-2 text-xs mt-2">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-white/70">Used</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-white/70">Free</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}
