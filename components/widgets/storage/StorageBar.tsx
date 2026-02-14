
import { WidgetProps } from '@/types/widgets';
import { BaseWidget } from '@/components/widgets/BaseWidget';
import { useStorage } from '@/hooks/useStorage';
import { HardDrive } from 'lucide-react';

export function StorageBarWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { data, loading } = useStorage();

    // Calculate total
    const totalBytes = data?.drives.reduce((acc, d) => acc + d.total, 0) || 0;
    const usedBytes = data?.drives.reduce((acc, d) => acc + d.used, 0) || 0;
    const percentage = totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
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
                        <HardDrive className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Storage</h3>
                        <p className="text-xs text-white/50">
                            {formatBytes(usedBytes)} used of {formatBytes(totalBytes)}
                        </p>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/70">
                        <span>Used</span>
                        <span>{percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}
