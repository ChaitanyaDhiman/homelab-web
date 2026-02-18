
import { useState, useEffect } from 'react';
import { StorageData } from '@/app/types/storage';

export function useStorage() {
    const [data, setData] = useState<StorageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStorage = async () => {
        try {
            const res = await fetch('/api/storage');
            if (!res.ok) throw new Error('Failed to fetch storage');
            const result = await res.json();
            if (result.success) {
                setData(result.data);
                setError(null);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStorage();
        const interval = setInterval(fetchStorage, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    return { data, loading, error, refetch: fetchStorage };
}
