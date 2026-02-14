
import { WidgetProps } from '@/types/widgets';
import { BaseWidget } from '@/components/widgets/BaseWidget';
import { useDocker } from '@/hooks/useDocker';
import { Box, Activity, Cpu, HardDrive, Network, Clock, Server } from 'lucide-react';

export function DockerWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { containers, loading, error } = useDocker();

    // Skeleton Loader Component
    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-24"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-32"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-16"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-20"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-16"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-16"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-20"></div></td>
            <td className="p-3"><div className="h-4 bg-white/10 rounded w-24"></div></td>
        </tr>
    );

    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="p-0 overflow-hidden" // Remove padding for table
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
                        <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-3 font-medium text-white/50">Name</th>
                                <th className="p-3 font-medium text-white/50">Image</th>
                                <th className="p-3 font-medium text-white/50">State</th>
                                <th className="p-3 font-medium text-white/50">Status</th>
                                <th className="p-3 font-medium text-white/50">CPU</th>
                                <th className="p-3 font-medium text-white/50">Mem</th>
                                <th className="p-3 font-medium text-white/50">Net</th>
                                <th className="p-3 font-medium text-white/50">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && containers.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : (
                                containers.map(c => (
                                    <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-3 font-medium text-white truncate max-w-[150px]" title={c.name}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${c.state === 'running'
                                                        ? c.health === 'healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-green-500'
                                                        : c.state === 'exited' ? 'bg-gray-500' : 'bg-red-500'
                                                    }`} />
                                                {c.name}
                                            </div>
                                        </td>
                                        <td className="p-3 text-white/60 truncate max-w-[150px]" title={c.image}>
                                            {c.image.split(':')[0]}
                                            <span className="text-white/30 text-[10px] ml-1">
                                                {c.image.split(':')[1] || 'latest'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${c.state === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                                                }`}>
                                                {c.state}
                                            </span>
                                        </td>
                                        <td className="p-3 text-white/60 truncate max-w-[120px]" title={c.status}>
                                            {c.status}
                                        </td>
                                        <td className="p-3 font-mono text-blue-300">{c.cpu}</td>
                                        <td className="p-3 font-mono text-purple-300">{c.memory}</td>
                                        <td className="p-3 font-mono text-orange-300">{c.netIO}</td>
                                        <td className="p-3 text-white/40 truncate max-w-[120px]" title={c.created}>
                                            {c.created}
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
