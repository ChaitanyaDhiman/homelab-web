
import { useState } from 'react';
import { WidgetProps } from '@/app/types/widgets';
import { BaseWidget } from '@/app/components/widgets/BaseWidget';
import { useDocker } from '@/app/hooks/useDocker';
import { Box, Activity, Cpu, HardDrive, Network, Clock, Server } from 'lucide-react';

export function DockerWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { containers, loading, error } = useDocker();
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Sorting Logic
    const sortedContainers = [...containers].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aValue: any = (a as any)[key];
        let bValue: any = (b as any)[key];

        // Parse numeric values for sorting
        if (key === 'cpu') {
            aValue = parseFloat(a.cpu.replace('%', '')) || 0;
            bValue = parseFloat(b.cpu.replace('%', '')) || 0;
        } else if (key === 'memory') {
            const parseMem = (s: string) => {
                const units = { 'B': 1, 'KB': 1024, 'MB': 1024 ** 2, 'GB': 1024 ** 3, 'TB': 1024 ** 4 };
                const match = s.match(/([\d.]+)([a-zA-Z]+)/);
                if (match) {
                    const val = parseFloat(match[1]);
                    const unit = match[2].toUpperCase() as keyof typeof units;
                    return val * (units[unit] || 1);
                }
                return 0;
            };
            aValue = parseMem(a.memory);
            bValue = parseMem(b.memory);
        } else if (key === 'netIO') {
            // Sort by download speed (first value)
            const parseNet = (s: string) => {
                const units = { 'B': 1, 'KB': 1024, 'MB': 1024 ** 2, 'GB': 1024 ** 3 };
                // Extract numeric part and unit "1.5 KB/s" -> 1.5, KB
                const match = s.match(/([\d.]+)\s*([a-zA-Z]+)/);
                if (match) {
                    const val = parseFloat(match[1]);
                    const unit = match[2].toUpperCase() as keyof typeof units;
                    return val * (units[unit] || 1);
                }
                return 0;
            };
            aValue = parseNet(a.netIO);
            bValue = parseNet(b.netIO);
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig?.key !== column) return <div className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-30"></div>;
        return <div className="w-3 h-3 ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</div>;
    };

    // Skeleton Loader Component
    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-24"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-16"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-16"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-20"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-16"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-32"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-20"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-24"></div></td>
        </tr>
    );

    const headers = [
        { key: 'name', label: 'Name' },
        { key: 'cpu', label: 'CPU' },
        { key: 'memory', label: 'Memory' },
        { key: 'netIO', label: 'Net' },
        { key: 'state', label: 'State' },
        { key: 'image', label: 'Image' },
        { key: 'status', label: 'Status' },
        { key: 'updated', label: 'Updated' },
    ];

    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="p-0 overflow-hidden"
        >
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-medium text-white">Containers</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {loading && <span className="text-xs text-blue-400 animate-pulse">Updating...</span>}
                        <span className="text-xs text-white/50">
                            {loading ? '...' : containers.length} active
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-xs text-white/80 whitespace-nowrap">
                        <thead className="bg-[#1a1b1e] sticky top-0 z-10">
                            <tr>
                                {headers.map(h => (
                                    <th
                                        key={h.key}
                                        className="p-3 font-medium text-white/50 cursor-pointer hover:text-white select-none whitespace-nowrap"
                                        onClick={() => requestSort(h.key)}
                                    >
                                        <div className="flex items-center group">
                                            {h.label}
                                            <SortIcon column={h.key} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && containers.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : (
                                sortedContainers.map(c => (
                                    <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                        {/* Name */}
                                        <td className="p-3 font-medium text-white truncate max-w-[150px]" title={c.name}>
                                            <div className="flex items-center gap-2">
                                                {c.name}
                                            </div>
                                        </td>
                                        {/* CPU */}
                                        <td className="p-3 font-mono text-blue-300">{c.cpu}</td>
                                        {/* Memory */}
                                        <td className="p-3 font-mono text-purple-300">{c.memory}</td>
                                        {/* Net */}
                                        <td className="p-3 font-mono text-orange-300">{c.netIO}</td>
                                        {/* Health (State) */}
                                        <td className="p-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${c.health === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                                                c.health === 'unhealthy' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-white/5 text-white/50'
                                                }`}>
                                                {c.health}
                                            </span>
                                        </td>
                                        {/* Image */}
                                        <td className="p-3 text-white/60 truncate max-w-[150px]" title={c.image}>
                                            {c.image.split(':')[0]}
                                            <span className="text-white/30 text-[10px] ml-1">
                                                {c.image.split(':')[1] || 'latest'}
                                            </span>
                                        </td>
                                        {/* Status */}
                                        <td className="p-3 text-white/60 truncate max-w-[120px]" title={c.status}>
                                            {c.status}
                                        </td>
                                        {/* Updated */}
                                        <td className="p-3 text-white/40 truncate max-w-[120px]" title={c.updated}>
                                            {c.updated}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {!loading && containers.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 text-white/30">
                            <Server className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No containers found</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 text-center text-red-400 text-xs bg-red-500/10 m-2 rounded">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </BaseWidget>
    );
}
