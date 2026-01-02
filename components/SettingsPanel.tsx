'use client';

import { Settings, Clock12, Clock4, Globe, Calendar, X, Eye, Sun, Moon, Monitor } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useState, useEffect } from 'react';

export function SettingsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [previewTime, setPreviewTime] = useState('');
    const [previewDate, setPreviewDate] = useState('');
    const { timeFormat, setTimeFormat, dateFormat, setDateFormat, theme, setTheme, getEffectiveTimeFormat } = useSettings();

    const effectiveFormat = getEffectiveTimeFormat();

    // Update preview every second
    useEffect(() => {
        const updatePreview = () => {
            const now = new Date();
            const effectiveTimeFormat = getEffectiveTimeFormat();

            // Format time
            let formattedTime: string;
            if (timeFormat === 'auto') {
                formattedTime = now.toLocaleTimeString();
            } else {
                formattedTime = now.toLocaleTimeString('en-US', {
                    hour12: effectiveTimeFormat === '12h',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
            setPreviewTime(formattedTime);

            // Format date
            let formattedDate: string;
            if (dateFormat === 'auto') {
                formattedDate = now.toLocaleDateString();
            } else {
                const options: Intl.DateTimeFormatOptions =
                    dateFormat === 'short' ? { month: 'numeric', day: 'numeric', year: '2-digit' } :
                        dateFormat === 'medium' ? { month: 'short', day: 'numeric', year: 'numeric' } :
                            { month: 'long', day: 'numeric', year: 'numeric' };
                formattedDate = now.toLocaleDateString('en-US', options);
            }
            setPreviewDate(formattedDate);
        };

        if (isOpen) {
            updatePreview();
            const interval = setInterval(updatePreview, 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen, timeFormat, dateFormat, getEffectiveTimeFormat]);

    return (
        <div className="fixed top-4 right-4 z-50">
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer p-3 rounded-xl bg-surface/50 hover:bg-surface-highlight/80 backdrop-blur-sm transition-all duration-200 shadow-lg border border-white/10 dark:border-white/10 border-black/5 text-foreground hover:scale-105 active:scale-95"
                title="Settings"
            >
                <Settings className={`w-5 h-5 transition-transform duration-500 ease-out ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Settings Modal/Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop - darker on mobile */}
                    <div
                        className="fixed inset-0 bg-black/60 md:bg-black/20 z-40 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel - Full screen on mobile, dropdown on desktop */}
                    <div className="fixed inset-x-0 bottom-0 md:absolute md:inset-auto md:top-16 md:right-0 md:w-[400px] bg-surface/95 backdrop-blur-xl rounded-t-3xl md:rounded-2xl p-6 md:p-6 shadow-2xl border-t md:border border-white/20 dark:border-white/20 border-black/5 z-50 space-y-6 max-h-[85vh] md:max-h-[600px] overflow-y-auto scrollbar-hide transition-all duration-300 animate-in slide-in-from-bottom-4 md:slide-in-from-top-2 fade-in">
                        {/* Header with close button */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Settings</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-surface-highlight transition-colors text-foreground/60 hover:text-foreground cursor-pointer"
                                aria-label="Close settings"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Theme Toggle - Compact */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                                <Sun className="w-4 h-4 text-foreground/60" />
                                <span className="text-sm font-medium text-foreground">Theme</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-foreground/60">Light</span>
                                <button
                                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    style={{
                                        backgroundColor: theme === 'dark' ? '#4f46e5' : '#cbd5e1'
                                    }}
                                >
                                    <span
                                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform"
                                        style={{
                                            transform: theme === 'dark' ? 'translateX(1.5rem)' : 'translateX(0.25rem)'
                                        }}
                                    />
                                </button>
                                <span className="text-xs text-foreground/60">Dark</span>
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-blue-500 dark:text-blue-300 text-xs font-medium uppercase tracking-wider">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Live Preview</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold font-mono text-foreground tabular-nums">
                                    {previewTime}
                                </div>
                                <div className="text-sm text-foreground/70">
                                    {previewDate}
                                </div>
                            </div>
                        </div>

                        {/* Time Format Setting */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-foreground/80 uppercase tracking-wider font-medium">
                                    Time Format
                                </label>
                                {timeFormat === 'auto' && (
                                    <span className="text-xs text-foreground/60 bg-surface-highlight px-2 py-1 rounded">
                                        Using: {effectiveFormat === '12h' ? '12-hour' : '24-hour'}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setTimeFormat('auto')}
                                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all cursor-pointer ${timeFormat === 'auto'
                                        ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
                                        : 'bg-surface-highlight/50 text-foreground/70 border-2 border-transparent hover:bg-surface-highlight hover:text-foreground'
                                        }`}
                                >
                                    <Globe className="w-4 h-4" />
                                    <span className="text-xs font-medium">Auto</span>
                                </button>
                                <button
                                    onClick={() => setTimeFormat('12h')}
                                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all cursor-pointer ${timeFormat === '12h'
                                        ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
                                        : 'bg-surface-highlight/50 text-foreground/70 border-2 border-transparent hover:bg-surface-highlight hover:text-foreground'
                                        }`}
                                >
                                    <Clock12 className="w-4 h-4" />
                                    <span className="text-xs font-medium">12-hour</span>
                                </button>
                                <button
                                    onClick={() => setTimeFormat('24h')}
                                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all cursor-pointer ${timeFormat === '24h'
                                        ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
                                        : 'bg-surface-highlight/50 text-foreground/70 border-2 border-transparent hover:bg-surface-highlight hover:text-foreground'
                                        }`}
                                >
                                    <Clock4 className="w-4 h-4" />
                                    <span className="text-xs font-medium">24-hour</span>
                                </button>
                            </div>
                        </div>

                        {/* Date Format Setting */}
                        <div className="space-y-3">
                            <label className="text-sm text-foreground/80 uppercase tracking-wider font-medium">
                                Date Format
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setDateFormat('auto')}
                                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all cursor-pointer ${dateFormat === 'auto'
                                        ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
                                        : 'bg-surface-highlight/50 text-foreground/70 border-2 border-transparent hover:bg-surface-highlight hover:text-foreground'
                                        }`}
                                >
                                    <Globe className="w-4 h-4" />
                                    <span className="text-xs font-medium">Auto</span>
                                </button>
                                <button
                                    onClick={() => setDateFormat('short')}
                                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all cursor-pointer ${dateFormat === 'short'
                                        ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
                                        : 'bg-surface-highlight/50 text-foreground/70 border-2 border-transparent hover:bg-surface-highlight hover:text-foreground'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-medium">Short</span>
                                </button>
                                <button
                                    onClick={() => setDateFormat('medium')}
                                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all cursor-pointer ${dateFormat === 'medium'
                                        ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
                                        : 'bg-surface-highlight/50 text-foreground/70 border-2 border-transparent hover:bg-surface-highlight hover:text-foreground'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-medium">Medium</span>
                                </button>
                                <button
                                    onClick={() => setDateFormat('long')}
                                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all cursor-pointer ${dateFormat === 'long'
                                        ? 'bg-blue-500/20 text-blue-500 dark:text-blue-300 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
                                        : 'bg-surface-highlight/50 text-foreground/70 border-2 border-transparent hover:bg-surface-highlight hover:text-foreground'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-medium">Long</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

