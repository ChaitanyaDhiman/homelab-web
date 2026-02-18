
import { useEffect, useState } from 'react';
import { WidgetProps } from '@/types/widgets';
import { useApps } from '@/hooks/useApps';
import { AppTile } from '@/components/apps/AppTile';
import { usageTracker } from '@/lib/usageTracker';
import { App } from '@/types/apps';
import { BaseWidget } from '@/components/widgets/BaseWidget';

export function FrequentAppsWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { apps, loading } = useApps();
    const [frequentApps, setFrequentApps] = useState<App[]>([]);

    useEffect(() => {
        // If in preview mode (id='preview'), show mock data if apps not loaded or just generic
        if (widget.id === 'preview') {
            setFrequentApps(apps.slice(0, 4));
            return;
        }

        if (!loading && apps.length > 0) {
            const topIds = usageTracker.getTopApps(4);
            const topApps = topIds
                .map(id => apps.find(a => a.id === id))
                .filter((a): a is App => !!a);

            let displayApps = topApps;

            // If fewer than 3 apps, fill with favorites first
            if (displayApps.length < 3) {
                const favorites = apps
                    .filter(a => a.isFavorite && !displayApps.some(da => da.id === a.id))
                    .slice(0, 4 - displayApps.length);
                displayApps = [...displayApps, ...favorites];
            }

            // If still fewer than 3, fill with other available apps
            if (displayApps.length < 3) {
                const others = apps
                    .filter(a => !displayApps.some(da => da.id === a.id))
                    .slice(0, 4 - displayApps.length);
                displayApps = [...displayApps, ...others];
            }

            setFrequentApps(displayApps);
        }
    }, [apps, loading, widget.id]);

    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="p-3" // Reduced padding
        >
            <div className="h-full flex flex-col">
                <h3 className="text-white/70 text-xs font-medium mb-2 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-primary">★</span> Frequently Visited
                </h3>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-white/30 text-xs">Loading...</div>
                ) : frequentApps.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-white/30 text-xs text-center">
                        No apps used yet
                    </div>
                ) : (
                    // Use flex with wrap for better scaling/centering
                    <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
                        {frequentApps.map(app => (
                            <div key={app.id} className="relative group overflow-hidden rounded-lg">
                                {/* Force small tile size and full container fit */}
                                <div className="absolute inset-0">
                                    <AppTile app={app} tileSize="small" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </BaseWidget>
    );
}
