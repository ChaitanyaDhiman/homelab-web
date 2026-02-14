
import { useState, useEffect } from 'react';

export interface ContainerInfo {
    id: string;
    name: string;
    image: string;
    status: string;
    state: string;
    created: string;
    health: string;
    cpu: string;
    memory: string;
    memoryLimit: string;
    netIO: string;
    blockIO: string;
    pids: string;
}

export function useDocker() {
    const [containers, setContainers] = useState<ContainerInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocker = async () => {
        try {
            const res = await fetch('/api/docker');
            if (!res.ok) throw new Error('Failed to fetch docker stats');
            const data = await res.json();
            setContainers(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocker();
        const interval = setInterval(fetchDocker, 5000); // 5s poll
        return () => clearInterval(interval);
    }, []);

    return { containers, loading, error, refetch: fetchDocker };
}
