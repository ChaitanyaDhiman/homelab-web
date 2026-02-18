'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ServiceHealthData {
    status: 'online' | 'offline' | 'degraded';
    responseTime: number;
    fallback?: boolean;
}

interface HealthContextType {
    servicesHealth: Record<string, ServiceHealthData>;
    loading: boolean;
    error: boolean;
    lastChecked: Date | null;
    refreshHealth: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
    const [servicesHealth, setServicesHealth] = useState<Record<string, ServiceHealthData>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const refreshHealth = useCallback(async () => {
        try {
            const res = await fetch('/api/health', { cache: 'no-store' });
            const json = await res.json();

            if (!json.success) throw new Error("Health check failed");

            setServicesHealth(json.data);
            setLastChecked(new Date());
            setError(false);
        } catch (err) {
            console.error("Health Context Error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshHealth();
        const interval = setInterval(refreshHealth, 30000);
        return () => clearInterval(interval);
    }, [refreshHealth]);

    return (
        <HealthContext.Provider value={{
            servicesHealth,
            loading,
            error,
            lastChecked,
            refreshHealth
        }}>
            {children}
        </HealthContext.Provider>
    );
}

export function useHealth() {
    const context = useContext(HealthContext);
    if (context === undefined) {
        throw new Error('useHealth must be used within a HealthProvider');
    }
    return context;
}
