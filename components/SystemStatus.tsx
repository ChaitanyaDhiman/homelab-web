"use client";

import { useEffect, useState } from "react";
import { Cpu, HardDrive, Activity, Thermometer, Clock } from "lucide-react";

interface SystemStats {
    cpu: number;
    memory: {
        total: number;
        used: number;
        free: number;
    };
    storage: {
        total: number;
        used: number;
        pcent: number;
    };
    temperature: number;
    uptime: number;
}

export function SystemStatus() {
    const [time, setTime] = useState<string>("");
    const [stats, setStats] = useState<SystemStats | null>(null);

    useEffect(() => {
        // Only access window/Date on client
        setTime(new Date().toLocaleTimeString());

        const updateTime = () => setTime(new Date().toLocaleTimeString());

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/system');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        fetchStats(); // Initial fetch

        const timeInterval = setInterval(updateTime, 1000);
        const statsInterval = setInterval(fetchStats, 5000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(statsInterval);
        };
    }, []);

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
        <div className="flex flex-col md:flex-row gap-6 mb-12">
            {/* Time Widget */}
            <div className="glass-panel p-6 rounded-2xl flex-1 flex items-center justify-between">
                <div>
                    <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">System Time</h2>
                    <div className="text-4xl font-bold font-mono mt-1 text-white tabular-nums">
                        {time || "--:--:--"}
                    </div>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
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
                    label="Memory"
                    value={stats ? formatBytes(stats.memory.used) : "..."}
                    icon={Activity}
                    color="text-purple-400"
                />
                <div className="w-px h-12 bg-white/10 hidden lg:block" />
                <StatusItem
                    label="Storage"
                    value={stats ? `${stats.storage.pcent}%` : "..."}
                    icon={HardDrive}
                    color="text-green-400"
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
