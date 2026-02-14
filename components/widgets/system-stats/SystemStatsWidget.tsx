"use client";

import { BaseWidget } from '../BaseWidget';
import { WidgetProps } from '@/types/widgets';
import { useSystem } from '@/contexts/SystemContext';
import { Cpu, Zap, Thermometer, Fan, Clock } from 'lucide-react';

export function SystemStatsWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const { stats, loading } = useSystem();

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getTemperatureColor = (temp: number) => {
        if (temp >= 80) return 'text-red-400';
        if (temp >= 60) return 'text-yellow-400';
        return 'text-green-400';
    };

    if (loading) {
        return (
            <BaseWidget title="System Stats" isEditMode={isEditMode} onRemove={onRemove}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </BaseWidget>
        );
    }

    return (
        <BaseWidget title="System Stats" isEditMode={isEditMode} onRemove={onRemove}>
            <div className="grid grid-cols-2 gap-4">
                {/* CPU Usage */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Cpu className="w-4 h-4" />
                        <span className="text-xs">CPU</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {stats?.cpu.toFixed(1)}%
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats?.cpu || 0}%` }}
                        />
                    </div>
                </div>

                {/* GPU Usage */}
                {stats?.gpu && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Zap className="w-4 h-4" />
                            <span className="text-xs">GPU</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {stats.gpu.utilization.toFixed(1)}%
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                                className="bg-secondary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${stats.gpu.utilization || 0}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Temperature */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Thermometer className="w-4 h-4" />
                        <span className="text-xs">Temp</span>
                    </div>
                    <div className={`text-2xl font-bold ${getTemperatureColor(stats?.temperature || 0)}`}>
                        {stats?.temperature}°C
                    </div>
                </div>

                {/* Fan Speed */}
                {stats?.fanSpeed && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Fan className="w-4 h-4" />
                            <span className="text-xs">Fan</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {stats.fanSpeed}
                        </div>
                    </div>
                )}

                {/* Uptime */}
                <div className="col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Uptime</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                        {formatUptime(stats?.uptime || 0)}
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}
