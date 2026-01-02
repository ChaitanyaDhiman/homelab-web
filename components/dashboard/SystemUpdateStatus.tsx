'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Download, RefreshCw, ShieldAlert, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpdateData {
    rebootRequired: boolean;
    rebootReasons: string[];
    lastUpdateCheck: string | null;
    updatesAvailable: number;
    securityUpdates: number;
    updatePackages?: string[];
    securityPackagesList?: string[];
}

export function UpdateStatus() {
    const [data, setData] = useState<UpdateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [showPackages, setShowPackages] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/updates');
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch update status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 5 minutes
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, []);

    const getBadgeColor = (securityCount: number, totalCount: number) => {
        if (securityCount > 0) return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (totalCount > 5) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    };

    if (loading) {
        return (
            <div className="glass-panel p-4 sm:p-6 rounded-2xl mb-8 flex items-center gap-3 sm:gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                    <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
                </div>
                <div>
                    <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const hasUpdates = data.updatesAvailable > 0;
    const hasSecurityUpdates = data.securityUpdates > 0;
    const isRebootRequired = data.rebootRequired;
    const badgeColor = getBadgeColor(data.securityUpdates, data.updatesAvailable);

    return (
        <div
            className="glass-panel p-4 sm:p-6 rounded-2xl mb-8 cursor-pointer transition-colors hover:bg-white/[0.07]"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">

                {/* Status Header Section */}
                <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-white/5 flex-shrink-0 ${isRebootRequired ? 'text-red-400 bg-red-500/10' :
                        hasUpdates ? 'text-blue-400 bg-blue-500/10' :
                            'text-green-400 bg-green-500/10'
                        }`}>
                        {isRebootRequired ? <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" /> :
                            hasUpdates ? <Download className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" /> :
                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                            {isRebootRequired ? 'System Reboot Required' :
                                hasUpdates ? 'Updates Available' :
                                    'System Up to Date'}
                        </h2>
                        <div className="text-xs sm:text-sm text-gray-400 truncate">
                            {data.lastUpdateCheck ?
                                `Last checked: ${new Date(data.lastUpdateCheck).toLocaleString()}` :
                                'Checking for updates...'}
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                {(hasUpdates || isRebootRequired) && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto items-stretch sm:items-center">
                        {isRebootRequired && (
                            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-red-500/10 border border-red-500/20 w-full sm:w-auto">
                                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs sm:text-sm font-medium text-red-400">Reboot Needed</span>
                                    {data.rebootReasons.length > 0 && (
                                        <span className="text-xs text-red-400/70 truncate">
                                            {data.rebootReasons[0]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {hasUpdates && (
                            <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border ${badgeColor} w-full sm:w-auto`}>
                                <Package className="h-4 w-4 flex-shrink-0" />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs sm:text-sm font-medium">
                                        {data.updatesAvailable} Updates
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs opacity-70">
                                            {hasSecurityUpdates ? `${data.securityUpdates} Security` : 'System Packages'}
                                        </span>
                                        {hasSecurityUpdates && (
                                            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="text-gray-500 self-center sm:ml-2">
                            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                    </div>
                )}

                {!hasUpdates && !isRebootRequired && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        <span>All systems operational</span>
                    </div>
                )}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && hasUpdates && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2 pl-0 sm:pl-2">
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${hasSecurityUpdates ? 'bg-red-400' : 'bg-blue-400'}`} />
                                {data.securityUpdates} security updates
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-500" />
                                {data.updatesAvailable - data.securityUpdates} regular updates
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPackages(!showPackages);
                                    }}
                                    className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                >
                                    View all packages
                                    <ChevronDown className={`h-4 w-4 transition-transform ${showPackages ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            {/* Package List */}
                            {showPackages && data.updatePackages && (
                                <div className="mt-3 space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                                    {/* Regular Updates */}
                                    {data.updatePackages.filter(pkg => !data.securityPackagesList?.includes(pkg)).length > 0 && (
                                        <>
                                            <div className="text-xs font-semibold text-gray-400 mb-2 sticky top-0 bg-[#0a0a0f] py-1">
                                                Regular Updates ({data.updatesAvailable - data.securityUpdates})
                                            </div>
                                            <div className="space-y-1">
                                                {data.updatePackages
                                                    .filter(pkg => !data.securityPackagesList?.includes(pkg))
                                                    .map((pkg, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded"
                                                        >
                                                            {pkg}
                                                        </div>
                                                    ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Security Updates */}
                                    {data.securityUpdates > 0 && data.securityPackagesList && (
                                        <>
                                            <div className="text-xs font-semibold text-red-400 mt-3 mb-2 sticky top-0 bg-[#0a0a0f] py-1">
                                                Security Updates ({data.securityUpdates})
                                            </div>
                                            <div className="space-y-1">
                                                {data.securityPackagesList.map((pkg, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 flex items-center gap-2"
                                                    >
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {pkg}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}