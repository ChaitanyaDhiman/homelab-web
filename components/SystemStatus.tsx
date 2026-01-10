"use client";

import { useEffect, useState } from "react";
import { Cpu, Gpu, Activity, Thermometer, Clock, Fan } from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";
import { useSettings } from "@/contexts/SettingsContext";

interface SystemStats {
    cpu: number;
    memory: {
        total: number;
        used: number;
        free: number;
    };
    gpu: {
        name: string;
        utilization: number;
        memory: number;
        memoryTotal: number;
        temperature: number;
    };
    temperature: number;
    uptime: number;
    fanSpeed: string;
}

export function SystemStatus() {
    const { stats, loading, error } = useSystem();
    const [time, setTime] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const { timeFormat, dateFormat, getEffectiveTimeFormat } = useSettings();

    useEffect(() => {
        // Only access window/Date on client
        const updateDateTime = () => {
            const now = new Date();
            const effectiveFormat = getEffectiveTimeFormat();

            // Format time
            let formattedTime: string;
            if (timeFormat === 'auto') {
                // Use browser's default locale
                formattedTime = now.toLocaleTimeString();
            } else {
                // Use user's preference
                formattedTime = now.toLocaleTimeString('en-US', {
                    hour12: effectiveFormat === '12h',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
            setTime(formattedTime);

            // Format date
            let formattedDate: string;
            if (dateFormat === 'auto') {
                // Use browser's default locale
                formattedDate = now.toLocaleDateString();
            } else {
                // Use user's preference
                const options: Intl.DateTimeFormatOptions =
                    dateFormat === 'short' ? { month: 'numeric', day: 'numeric', year: '2-digit' } :
                        dateFormat === 'medium' ? { month: 'short', day: 'numeric', year: 'numeric' } :
                            { month: 'long', day: 'numeric', year: 'numeric' };
                formattedDate = now.toLocaleDateString('en-US', options);
            }
            setDate(formattedDate);
        };

        updateDateTime();
        const timeInterval = setInterval(updateDateTime, 1000);

        return () => {
            clearInterval(timeInterval);
        };
    }, [timeFormat, dateFormat, getEffectiveTimeFormat]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        parts.push(`${minutes}m`);

        return parts.join(' ');
    };

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Date/Time Widget */}
            <div className="glass-panel p-6 rounded-2xl w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-3">
                    <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">System Date & Time</h2>
                    <div className="text-2xl sm:text-3xl font-bold font-mono mt-1 text-white tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                        {time || "--:--:--"}
                    </div>
                    <div className="text-sm text-gray-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {date || "--/--/--"}
                    </div>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-6 h-6 text-[var(--primary)] animate-pulse" />
                </div>
            </div>

            {/* Stats Widget */}
            <div className="glass-panel p-6 rounded-2xl flex-[2] grid grid-cols-2 lg:flex items-center justify-around gap-4">
                <StatusItem
                    label="CPU Usage"
                    value={stats ? `${stats.cpu}%` : "..."}
                    icon={Cpu}
                    color="text-blue-400"
                />
                <div className="w-px h-12 bg-white/10 hidden lg:block" />
                <StatusItem
                    label="GPU Usage"
                    value={stats ? `${stats.gpu.utilization}%` : "..."}
                    icon={Gpu}
                    color="text-green-400"
                />
                <div className="w-px h-12 bg-white/10 hidden lg:block" />
                <StatusItem
                    label="Memory"
                    value={stats ? formatBytes(stats.memory.used) : "..."}
                    icon={Activity}
                    color="text-purple-400"
                />
                <div className="w-px h-12 bg-white/10 hidden lg:block" />
                <StatusItem
                    label="Temp"
                    value={stats?.temperature && stats.temperature > 0 ? `${Math.round(stats.temperature)}°C` : "--"}
                    icon={Thermometer}
                    color="text-red-400"
                />
                <div className="w-px h-12 bg-white/10 hidden lg:block" />
                <StatusItem
                    label="Fan Speed"
                    value={stats?.fanSpeed || "Off"}
                    icon={Fan}
                    color="text-cyan-400"
                />
                <div className="w-px h-12 bg-white/10 hidden lg:block" />
                <StatusItem
                    label="Uptime"
                    value={stats ? formatUptime(stats.uptime) : "..."}
                    icon={Clock}
                    color="text-yellow-400"
                />
            </div>
        </div>
    );
}

function StatusItem({ label, value, icon: Icon, color, className = "" }: any) {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
                <div className="text-xl font-bold text-white">{value}</div>
            </div>
        </div>
    );
}
