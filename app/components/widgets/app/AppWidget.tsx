
import { useEffect, useState, useRef } from 'react';
import { WidgetProps } from '@/app/types/widgets';
import { BaseWidget } from '@/app/components/widgets/BaseWidget';
import { useApps } from '@/app/hooks/useApps';
import { AppTile } from '@/app/components/apps/AppTile';
import { Search, X } from 'lucide-react';
import { App } from '@/app/types/apps';
import { usageTracker } from '@/app/lib/usageTracker';

export function AppWidget({ widget, isEditMode, onRemove, onUpdateConfig }: WidgetProps) {
    const { apps, loading } = useApps();
    const [searchTerm, setSearchTerm] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const configuredAppId = widget.config?.appId;
    const pickerRef = useRef<HTMLDivElement>(null);
    const [selectedApp, setSelectedApp] = useState<App | undefined>(undefined);

    useEffect(() => {
        if (apps.length > 0 && configuredAppId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedApp(apps.find(a => a.id === configuredAppId));
        }
    }, [apps, configuredAppId]);

    // Handle clicks outside picker to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    // This widget updates its own config in the parent's state
    // We assume the parent component (WidgetGrid) listens to changes
    // But WidgetGrid typically manages state.
    // For now, we'll use a custom event or context if needed, but since we can't easily prop drill updateWidget here without changing WidgetProps...
    // Wait, WidgetProps usually has updateWidget? No.
    // We need a way to save configuration.
    // For this generic widget, we might need to rely on the fact that `widget.config` is mutable or we need to update the global state.
    // I'll emit a custom event 'update-widget-config' which WidgetGrid should listen to?
    // Or better: I'll update `types/widgets.ts` to include `onUpdateConfig` in `WidgetProps` and update WidgetGrid to pass it.

    // For now, I'll assume I can't save config easily without modifying WidgetGrid.
    // I will modify WidgetGrid to pass onUpdateConfig.

    const handleSelectApp = (app: App) => {
        if (onUpdateConfig) {
            onUpdateConfig({ appId: app.id });
        }
        setShowPicker(false);
        setSelectedApp(app);
    };

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-full w-full flex items-center justify-center text-white/50">Loading...</div>;

    // Configured state
    if (selectedApp) {
        return (
            <div className="h-full w-full relative group">
                {isEditMode && (
                    <div className="absolute top-2 right-2 z-20 flex gap-2">
                        <button
                            onClick={() => setShowPicker(true)}
                            className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white/70 hover:text-white transition-colors"
                            title="Change App"
                        >
                            <Search className="w-3 h-3" />
                        </button>
                        {onRemove && (
                            <button
                                onClick={onRemove}
                                className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors shadow-sm"
                                title="Remove Widget"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}

                {showPicker ? (
                    <div ref={pickerRef} className="absolute inset-0 bg-surface z-30 flex flex-col p-2 rounded-xl border border-white/10 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <button onClick={() => setShowPicker(false)} className="text-white/50 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredApps.map(app => (
                                <button
                                    key={app.id}
                                    onClick={(e) => { e.stopPropagation(); handleSelectApp(app); }}
                                    className="w-full text-left flex items-center gap-2 p-2 hover:bg-white/5 rounded group/item"
                                >
                                    {/* We don't render full icon component here to keep it light, or maybe we do */}
                                    <span className="text-white text-sm truncate">{app.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // We render AppTile but we want it to fill the widget
                    <div
                        className={`h-full w-full ${isEditMode ? 'pointer-events-none' : ''}`}
                        onClick={() => !isEditMode && usageTracker.trackAppOpen(selectedApp.id)}
                    >
                        <AppTile app={selectedApp} tileSize="medium" />
                    </div>
                )}
            </div>
        );
    }

    // Unconfigured state
    return (
        <BaseWidget
            isEditMode={isEditMode}
            onRemove={onRemove}
        >
            <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <button
                    onClick={() => setShowPicker(true)}
                    className="flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors group"
                >
                    <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                        <Search className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Select App</span>
                </button>

                {showPicker && (
                    <div ref={pickerRef} className="absolute inset-0 bg-surface z-30 flex flex-col p-2 rounded-xl border border-white/10 overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <button onClick={() => setShowPicker(false)} className="text-white/50 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1">
                            {filteredApps.map(app => (
                                <button
                                    key={app.id}
                                    onClick={(e) => { e.stopPropagation(); handleSelectApp(app); }}
                                    className="w-full text-left flex items-center gap-2 p-2 hover:bg-white/5 rounded"
                                >
                                    <span className="text-white text-sm truncate">{app.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </BaseWidget>
    );
}
