'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Activity, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { services } from '@/app/config/services';
import { useSettings } from '@/contexts/SettingsContext';

interface HealthSummaryData {
    total: number;
    online: number;
    degraded: number;
    offline: number;
}

interface ServiceHealth {
    id: string;
    status: 'online' | 'offline' | 'degraded';
    responseTime?: number;
}

export function HealthSummary() {
    const [data, setData] = useState<HealthSummaryData | null>(null);
    const [lastChecked, setLastChecked] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { timeFormat, getEffectiveTimeFormat } = useSettings();

    useEffect(() => {
        const checkAllServices = async () => {
            try {
                const results: ServiceHealth[] = await Promise.all(
                    services.map(async (service) => {
                        if (!service.url || service.url.startsWith('/')) {
                            return { id: service.id, status: 'offline' as const };
                        }

                        const startTime = performance.now();
                        try {
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 5000);

                            await fetch(service.url, {
                                method: 'HEAD',
                                mode: 'no-cors',
                                cache: 'no-store',
                                signal: controller.signal,
                            });

                            clearTimeout(timeoutId);
                            const endTime = performance.now();
                            const responseTime = Math.round(endTime - startTime);
                            const isDegraded = responseTime > 2000;

                            return {
                                id: service.id,
                                status: isDegraded ? ('degraded' as const) : ('online' as const),
                                responseTime,
                            };
                        } catch {
                            const endTime = performance.now();
                            const responseTime = Math.round(endTime - startTime);

                            // Quick response might be CORS-blocked but service is up
                            if (responseTime < 1000) {
                                return { id: service.id, status: 'online' as const, responseTime };
                            }
                            return { id: service.id, status: 'offline' as const };
                        }
                    })
                );

                const summary: HealthSummaryData = {
                    total: results.length,
                    online: results.filter(s => s.status === 'online').length,
                    degraded: results.filter(s => s.status === 'degraded').length,
                    offline: results.filter(s => s.status === 'offline').length,
                };

                setData(summary);

                // Format timestamp using settings
                const now = new Date();
                const effectiveFormat = getEffectiveTimeFormat();
                let formattedTime: string;
                if (timeFormat === 'auto') {
                    formattedTime = now.toLocaleTimeString();
                } else {
                    formattedTime = now.toLocaleTimeString('en-US', {
                        hour12: effectiveFormat === '12h',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                }
                setLastChecked(formattedTime);
                setError(false);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        checkAllServices();
        const interval = setInterval(checkAllServices, 30000);
        return () => clearInterval(interval);
    }, [timeFormat, getEffectiveTimeFormat]);

    if (loading) {
        return (
            <div className="w-full h-32 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                    <span className="text-sm text-gray-400">Loading system health...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="w-full p-6 bg-red-500/10 rounded-lg border border-red-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <div>
                        <h3 className="text-red-400 font-medium">System Monitor Unavailable</h3>
                        <p className="text-sm text-red-400/70">Unable to connect to health service</p>
                    </div>
                </div>
            </div>
        );
    }

    const healthPercentage = data.total > 0 ? Math.round((data.online / data.total) * 100) : 0;

    // Determine health status color: green (100%), yellow (>80% & no offline), red (otherwise)
    const getHealthStatus = () => {
        if (healthPercentage === 100) return 'green';
        if (healthPercentage >= 80 && data.offline === 0) return 'yellow';
        return 'red';
    };

    const healthStatus = getHealthStatus();

    return (
        <div className="w-full">
            {/* Summary Card */}
            <div className="glass-panel p-4 sm:p-6 rounded-2xl cursor-pointer transition-colors hover:bg-white/[0.07]" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 border ${healthStatus === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            healthStatus === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base sm:text-lg font-semibold text-white truncate">Service Health</h2>
                        </div>
                    </div>

                    {/* Status Display - Right Side */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto items-stretch sm:items-center">
                        <div className={`hidden md:flex items-center gap-2 pl-4 pr-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 cursor-default ${healthStatus === 'green' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' :
                            healthStatus === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' :
                                'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            }`}>
                            {healthStatus === 'green' ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <div className={`w-2 h-2 rounded-full animate-pulse ${healthStatus === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />
                            )}
                            <span>
                                {healthPercentage}% - {data.online}/{data.total} Services Online
                            </span>
                            <div className={`h-4 w-px mx-1 ${healthStatus === 'green' ? 'bg-green-500/20' :
                                healthStatus === 'yellow' ? 'bg-yellow-500/20' :
                                    'bg-red-500/20'
                                }`} />
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="pt-4 bg-inherit">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 mt-4 sm:mt-6">
                                    {/* Online Stats */}
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/5 nav-border hover:bg-green-500/10 transition-colors">
                                        <div className="p-2 rounded-full bg-green-500/10">
                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white">{data.online}</div>
                                            <div className="text-xs text-gray-400 tracking-wider">Online</div>
                                        </div>
                                    </div>

                                    {/* Degraded Stats */}
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-500/5 nav-border hover:bg-yellow-500/10 transition-colors">
                                        <div className="p-2 rounded-full bg-yellow-500/10">
                                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white">{data.degraded}</div>
                                            <div className="text-xs text-gray-400 tracking-wider">Slow</div>
                                        </div>
                                    </div>

                                    {/* Offline Stats */}
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-red-500/5 nav-border hover:bg-red-500/10 transition-colors">
                                        <div className="p-2 rounded-full bg-red-500/10">
                                            <XCircle className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white">{data.offline}</div>
                                            <div className="text-xs text-gray-400 tracking-wider">Offline</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Health Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Overall Status</span>
                                        <span className={
                                            healthStatus === 'green' ? 'text-green-400' :
                                                healthStatus === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                                        }>
                                            {healthPercentage}% Operational
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${healthPercentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${healthStatus === 'green' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                                healthStatus === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                                    'bg-gradient-to-r from-red-400 to-red-500'
                                                }`}
                                        />
                                    </div>
                                    {lastChecked && (
                                        <div className="text-right pt-2">
                                            <span className="text-xs text-gray-500">Last checked: {lastChecked}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
