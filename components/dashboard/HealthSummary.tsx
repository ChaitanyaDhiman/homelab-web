'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HealthSummaryData {
    total: number;
    online: number;
    degraded: number;
    offline: number;
}

interface HealthResponse {
    summary: HealthSummaryData;
    timestamp: string;
}

export function HealthSummary() {
    const [data, setData] = useState<HealthSummaryData | null>(null);
    const [lastChecked, setLastChecked] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch('/api/health');
                if (!res.ok) throw new Error('Failed to fetch');
                const json: HealthResponse = await res.json();
                setData(json.summary);
                setLastChecked(new Date(json.timestamp).toLocaleTimeString());
                setError(false);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

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
        <div className="w-full space-y-4">
            {/* Summary Card */}
            <div className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden transition-colors hover:bg-white/[0.07]">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Service Health</h2>

                        {!isExpanded && (
                            <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-black/20 border border-white/5">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${healthStatus === 'green' ? 'bg-green-500' :
                                        healthStatus === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />
                                <span className="text-xs text-gray-300">
                                    {healthPercentage}% - {data.online}/{data.total} Services Online
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="p-6 pt-0 border-t border-white/5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
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
