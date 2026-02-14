
import { WidgetProps } from '@/types/widgets';
import { BaseWidget } from '@/components/widgets/BaseWidget';
import { useDocker } from '@/hooks/useDocker';
import { Box, Circle } from 'lucide-react';

export function DockerWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { containers, loading } = useDocker();

    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="p-0 overflow-hidden" // Remove padding for table
        >
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-medium text-white">Containers</h3>
                    </div>
                    <span className="text-xs text-white/50">{containers.length} active</span>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-xs text-white/70">
                        <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-2 font-medium">Name</th>
                                <th className="p-2 font-medium">State</th>
                                <th className="p-2 font-medium">CPU</th>
                                <th className="p-2 font-medium">Mem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {containers.map(c => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-2 font-medium text-white truncate max-w-[100px]" title={c.name}>
                                        {c.name}
                                    </td>
                                    <td className="p-2">
                                        <div className="flex items-center gap-1.5" title={`${c.status} (${c.health})`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${c.state === 'running'
                                                    ? c.health === 'healthy' ? 'bg-emerald-500' : 'bg-green-400'
                                                    : 'bg-red-500'
                                                }`} />
                                            <span className="truncate max-w-[80px]">{c.state}</span>
                                        </div>
                                    </td>
                                    <td className="p-2 font-mono">{c.cpu}</td>
                                    <td className="p-2 font-mono">{c.memory}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {containers.length === 0 && !loading && (
                        <div className="p-4 text-center text-white/30 text-xs">No containers found</div>
                    )}
                </div>
            </div>
        </BaseWidget>
    );
}
