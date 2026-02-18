
import { useState, useEffect } from 'react';
import { App, AppsConfig } from '@/app/types/apps';

interface UseAppsResult {
    apps: App[];
    config: AppsConfig | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useApps(): UseAppsResult {
    const [config, setConfig] = useState<AppsConfig | null>(null);
    const [apps, setApps] = useState<App[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApps = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/apps');
            if (!response.ok) throw new Error('Failed to fetch apps');

            const data: AppsConfig = await response.json();
            setConfig(data);

            // Flatten all apps
            const allApps = [
                ...(data.uncategorizedApps || []),
                ...(data.categories || []).flatMap(cat => cat.apps)
            ];
            setApps(allApps);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    return { apps, config, loading, error, refresh: fetchApps };
}
