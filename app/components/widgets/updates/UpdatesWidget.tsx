"use client";

import { BaseWidget } from '../BaseWidget';
import { WidgetProps } from '@/app/types/widgets';
import { useEffect, useState } from 'react';
import { Download, AlertCircle, CheckCircle, RefreshCw, Package, ShieldAlert } from 'lucide-react';

interface UpdateData {
    available: number;
    security: number;
    rebootRequired: boolean;
    packages: string[];
    securityPackages: string[];
}

export function UpdatesWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const [updates, setUpdates] = useState<UpdateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUpdates = async () => {
        try {
            const response = await fetch('/api/updates');
            if (!response.ok) throw new Error('Failed to fetch updates');
            const json = await response.json();
            if (json.success && json.data) {
                const data = json.data;
                setUpdates({
                    available: data.updatesAvailable || 0,
                    security: data.securityUpdates || 0,
                    rebootRequired: data.rebootRequired || false,
                    packages: data.updatePackages || [],
                    securityPackages: data.securityPackagesList || []
                });
            }
        } catch (error) {
            console.error('Error fetching updates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUpdates();
        const interval = setInterval(fetchUpdates, 300000); // 5 min
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetch('/api/updates/refresh', { method: 'POST' });
            // Wait a bit for the backend to start the update check
            setTimeout(() => {
                fetchUpdates();
                setRefreshing(false);
            }, 2000);
        } catch (error) {
            console.error('Error refreshing updates:', error);
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <BaseWidget title="Updates" isEditMode={isEditMode} onRemove={onRemove}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </BaseWidget>
        );
    }

    // Filter out security packages from the main list to get "other" updates
    const securityPkgs = updates?.securityPackages || [];
    const otherPkgs = (updates?.packages || []).filter(pkg => !securityPkgs.includes(pkg));
    const totalCount = updates?.available || 0;
    const securityCount = updates?.security || 0;
    const otherCount = otherPkgs.length;

    return (
        <BaseWidget
            title="System Updates"
            isEditMode={isEditMode}
            onRemove={onRemove}
            className="overflow-hidden flex flex-col"
            actions={
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={`p-1 rounded-md hover:bg-white/10 transition-colors ${refreshing ? 'animate-spin text-blue-400' : 'text-white/50 hover:text-white'}`}
                    title="Check for updates"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            }
        >
            <div className="flex flex-col h-full">
                {/* Summary Grid */}
                {totalCount > 0 && (
                    <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/5 shrink-0">
                        <div className="flex flex-col items-center p-2 bg-blue-500/10 rounded-lg">
                            <Download className="w-5 h-5 text-blue-400 mb-1" />
                            <div className="text-lg font-bold text-white">{totalCount}</div>
                            <div className="text-xs text-gray-400">Total</div>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-red-500/10 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-red-400 mb-1" />
                            <div className="text-lg font-bold text-white">{securityCount}</div>
                            <div className="text-xs text-gray-400">Security</div>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                            <Package className="w-5 h-5 text-gray-400 mb-1" />
                            <div className="text-lg font-bold text-white">{otherCount}</div>
                            <div className="text-xs text-gray-400">Other</div>
                        </div>
                    </div>
                )}

                {/* Lists */}
                <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
                    {totalCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <CheckCircle className="w-12 h-12 text-green-400 mb-2" />
                            <p className="text-sm text-gray-400">System is up to date</p>
                        </div>
                    ) : (
                        <>
                            {securityPkgs.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3" />
                                        Security Updates
                                    </div>
                                    <div className="space-y-1">
                                        {securityPkgs.map((pkg, i) => (
                                            <div key={`sec-${i}`} className="text-sm text-red-300 bg-red-500/5 px-2 py-1 rounded truncate">
                                                {pkg}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {otherPkgs.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Package className="w-3 h-3" />
                                        Other Updates
                                    </div>
                                    <div className="space-y-1">
                                        {otherPkgs.map((pkg, i) => (
                                            <div key={`other-${i}`} className="text-sm text-gray-400 px-2 py-1 truncate hover:text-white transition-colors">
                                                {pkg}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {updates?.rebootRequired && (
                    <div className="p-3 bg-orange-500/10 border-t border-orange-500/20 flex items-center justify-center gap-2 shrink-0">
                        <RefreshCw className="w-4 h-4 text-orange-400 animate-spin-slow" />
                        <span className="text-xs font-medium text-orange-400">Reboot Required</span>
                    </div>
                )}
            </div>
        </BaseWidget>
    );
}
