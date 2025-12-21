'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Activity } from 'lucide-react';


interface ServiceHealth {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'degraded';
    responseTime?: number;
    statusCode?: number;
    error?: string;
}

interface HealthResponse {
    services: ServiceHealth[];
}

export function ServiceHealthIndicator({ serviceId }: { serviceId: string }) {
    const [health, setHealth] = useState<ServiceHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch('/api/health');
                if (!res.ok) throw new Error('Failed to fetch');
                const data: HealthResponse = await res.json();
                const serviceData = data.services.find(s => s.id === serviceId);
                if (serviceData) {
                    setHealth(serviceData);
                    setError(false);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, [serviceId]);

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500/50 animate-pulse" />
            </div>
        );
    }

    if (error || !health) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" title="Unknown Status" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
            case 'degraded': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]';
            case 'offline': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
            default: return 'bg-gray-500';
        }
    };

    const statusClass = getStatusColor(health.status);

    const getResponseTimeColor = (ms: number) => {
        if (ms < 200) return 'text-green-500';
        if (ms < 500) return 'text-yellow-500';
        if (ms < 2000) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="flex items-center gap-2">
            {/* Bubble */}
            <div
                className={`w-2 h-2 rounded-full ${statusClass} transition-all duration-300`}
                title={`Status: ${health.status}`}
            />

            {/* MS Value */}
            {health.status !== 'offline' && health.responseTime !== undefined && (
                <span className={`text-xs font-mono ${getResponseTimeColor(health.responseTime)}`}>
                    {health.responseTime}ms
                </span>
            )}

            {health.error && (
                <div className="group relative">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 cursor-help opacity-50 hover:opacity-100 transition-opacity" />
                    <div className="absolute top-full right-0 mt-2 px-2 py-1 text-xs bg-gray-900 border border-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        {health.error}
                    </div>
                </div>
            )}
        </div>
    );
}
