
import { WidgetProps } from '@/app/types/widgets';
import { BaseWidget } from '@/app/components/widgets/BaseWidget';
import { useSystem } from '@/app/contexts/SystemContext';
import { ArrowDown, ArrowUp, Activity } from 'lucide-react';

export function NetworkWidget({ isEditMode, onRemove }: WidgetProps) {
    const { stats } = useSystem();

    // Stats are in bytes/sec? systeminformation.networkStats returns bytes/sec usually?
    // si docs: rx_sec: transfer rate (bytes/sec)

    const rx = stats?.network?.rx_sec || 0;
    const tx = stats?.network?.tx_sec || 0;

    const formatSpeed = (bytes: number) => {
        if (bytes === 0) return '0 B/s';
        const k = 1024;
        const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="p-4"
        >
            <div className="h-full flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-white/5">
                        <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-sm font-medium text-white">Network</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-1 text-emerald-400 text-xs">
                            <ArrowDown className="w-3 h-3" />
                            <span>Down</span>
                        </div>
                        <span className="text-lg font-bold text-white">{formatSpeed(rx)}</span>
                    </div>

                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-1 text-blue-400 text-xs">
                            <ArrowUp className="w-3 h-3" />
                            <span>Up</span>
                        </div>
                        <span className="text-lg font-bold text-white">{formatSpeed(tx)}</span>
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}
