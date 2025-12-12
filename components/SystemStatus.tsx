"use client";

import { useEffect, useState } from "react";
import { Cpu, HardDrive, Activity } from "lucide-react";

export function SystemStatus() {
    const [time, setTime] = useState<string>("");

    useEffect(() => {
        // Only access window/Date on client
        setTime(new Date().toLocaleTimeString());
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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

            {/* Mock Stats Widget */}
            <div className="glass-panel p-6 rounded-2xl flex-[2] flex items-center justify-around gap-4">
                <StatusItem label="CPU Usage" value="12%" icon={Cpu} color="text-blue-400" />
                <div className="w-px h-12 bg-white/10" />
                <StatusItem label="Memory" value="4.2 GB" icon={Activity} color="text-purple-400" />
                <div className="w-px h-12 bg-white/10" />
                <StatusItem label="Storage" value="45%" icon={Activity} color="text-green-400" />
            </div>
        </div>
    );
}

function StatusItem({ label, value, icon: Icon, color }: any) {
    return (
        <div className="flex items-center gap-4">
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
