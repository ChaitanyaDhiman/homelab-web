'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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

interface SystemContextType {
    stats: SystemStats | null;
    loading: boolean;
    error: boolean;
    lastUpdated: Date | null;
    refreshStats: () => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: ReactNode }) {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const refreshStats = useCallback(async () => {
        try {
            const res = await fetch('/api/system', { cache: 'no-store' });
            if (!res.ok) throw new Error("Stats fetch failed");

            const data = await res.json();
            setStats(data);
            setLastUpdated(new Date());
            setError(false);
        } catch (err) {
            console.error("System Context Error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshStats();
        // System stats usually need more frequent updates than health (e.g. 5-10s)
        const interval = setInterval(refreshStats, 5000);
        return () => clearInterval(interval);
    }, [refreshStats]);

    return (
        <SystemContext.Provider value={{
            stats,
            loading,
            error,
            lastUpdated,
            refreshStats
        }}>
            {children}
        </SystemContext.Provider>
    );
}

export function useSystem() {
    const context = useContext(SystemContext);
    if (context === undefined) {
        throw new Error('useSystem must be used within a SystemProvider');
    }
    return context;
}
