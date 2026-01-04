'use client';

import { useEffect, useState } from 'react';
import { Battery, BatteryCharging, BatteryWarning, Zap, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BatteryData {
    isCharging: boolean;
    percentage: number;
    state: string;
    currentPower: number;
    voltage: number;
    designCapacity: number;
    fullCapacity: number;
    currentCapacity: number;
    health: number;
    cycleCount: number;
    timeRemaining: string | null;
    temperature?: number;
    manufacturer?: string;
    model?: string;
}

export function BatteryWidget() {
    const [battery, setBattery] = useState<BatteryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const fetchBattery = async () => {
            try {
                const res = await fetch('/api/battery');
                const json = await res.json();
                if (json.success) {
                    setBattery(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch battery:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBattery();
        const interval = setInterval(fetchBattery, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="glass-panel p-4 sm:p-6 rounded-2xl mb-8 flex items-center gap-3 sm:gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                    <Battery className="h-6 w-6 text-gray-400 animate-pulse" />
                </div>
                <div>
                    <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (!battery) {
        return null;
    }

    // Determine battery icon and color
    const getBatteryIcon = () => {
        if (battery.isCharging) return BatteryCharging;
        if (battery.percentage < 20) return BatteryWarning;
        return Battery;
    };

    const getBatteryColor = () => {
        if (battery.isCharging) return 'text-green-400';
        if (battery.percentage < 20) return 'text-red-400';
        if (battery.percentage < 50) return 'text-yellow-400';
        return 'text-green-400';
    };

    const getBgColor = () => {
        if (battery.isCharging) return 'bg-green-500/10 border-green-500/20';
        if (battery.percentage < 20) return 'bg-red-500/10 border-red-500/20';
        if (battery.percentage < 50) return 'bg-yellow-500/10 border-yellow-500/20';
        return 'bg-green-500/10 border-green-500/20';
    };

    const BatteryIcon = getBatteryIcon();
    const batteryColor = getBatteryColor();
    const bgColor = getBgColor();

    return (
        <div
            className="glass-panel p-4 sm:p-6 rounded-2xl cursor-pointer transition-colors hover:bg-white/[0.07]"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">

                {/* Header Left */}
                <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 border ${bgColor} ${batteryColor}`}>
                        <BatteryIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-semibold text-white truncate">System Battery</h2>
                    </div>
                </div>

                {/* Header Right / Status */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto items-stretch sm:items-center">
                    <div className={`hidden md:flex items-center gap-2 pl-4 pr-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 cursor-default ${bgColor} ${batteryColor}`}>
                        <span className="flex items-center gap-2">
                            {battery.percentage}% - {battery.state}
                        </span>

                        <div className="hidden md:block h-4 w-px mx-1 bg-current opacity-20" />
                        <ChevronDown className={`hidden md:block w-4 h-4 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
                    </div>

                    <div className="text-gray-500 self-center sm:ml-2 md:hidden">
                        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-white/5 pl-0 sm:pl-2">
                            {/* Battery Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Current Charge</span>
                                    <span className={batteryColor}>{battery.percentage}%</span>
                                </div>
                                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${battery.percentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${battery.isCharging
                                            ? 'bg-gradient-to-r from-green-400 to-green-500'
                                            : battery.percentage < 20
                                                ? 'bg-gradient-to-r from-red-400 to-red-500'
                                                : battery.percentage < 50
                                                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                                    : 'bg-gradient-to-r from-green-400 to-green-500'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                    <div className="text-gray-400 text-xs">Status</div>
                                    <div className="font-medium text-white flex items-center gap-2">
                                        {battery.state}
                                        {battery.timeRemaining && (
                                            <span className="text-xs text-gray-500">({battery.timeRemaining})</span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                    <div className="text-gray-400 text-xs">Health</div>
                                    <div className={`font-medium flex items-center gap-2 ${battery.health >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {battery.health}%
                                        {battery.health < 80 && <AlertTriangle className="h-3 w-3" />}
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                    <div className="text-gray-400 text-xs">Power Usage</div>
                                    <div className="font-medium text-white flex items-center gap-2">
                                        <Zap className="h-3 w-3 text-yellow-400" />
                                        {battery.currentPower}W
                                    </div>
                                </div>
                                {battery.temperature && (
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                        <div className="text-gray-400 text-xs">Temperature</div>
                                        <div className="font-medium text-white">{battery.temperature}°C</div>
                                    </div>
                                )}
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                    <div className="text-gray-400 text-xs">Capacity</div>
                                    <div className="font-medium text-white">{battery.fullCapacity} / {battery.designCapacity} Wh</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                                    <div className="text-gray-400 text-xs">Voltage</div>
                                    <div className="font-medium text-white">{battery.voltage}V</div>
                                </div>
                            </div>

                            {battery.manufacturer && (
                                <div className="mt-4 pt-4 border-t border-white/5 text-right">
                                    <span className="text-xs text-gray-500">
                                        Device: {battery.manufacturer} {battery.model} ({battery.cycleCount} cycles)
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}