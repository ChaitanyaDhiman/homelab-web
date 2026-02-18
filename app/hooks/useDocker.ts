
import { useState, useEffect, useRef } from 'react';

export interface ContainerInfo {
    id: string;
    name: string;
    image: string;
    status: string;
    state: string;
    updated: string;
    health: string;
    cpu: string;
    memory: string;
    memoryLimit: string;
    netIO: string;
    netRx?: number;
}

export function useDocker() {
    const [containers, setContainers] = useState<ContainerInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Store previous fetch data for rate calculation: { [key: string]: { rx: number, time: number } }
    const prevDataRef = useRef<Record<string, { rx: number, time: number }>>({});

    const fetchDocker = async () => {
        try {
            const res = await fetch('/api/docker');
            if (!res.ok) throw new Error('Failed to fetch docker stats');
            const data: ContainerInfo[] = await res.json();
            const now = Date.now();

            const updatedContainers = data.map(container => {
                let netIO = container.netIO; // Default to cumulative if calc fails

                if (typeof container.netRx === 'number') {
                    const prev = prevDataRef.current[container.id];
                    if (prev) {
                        const timeDiff = (now - prev.time) / 1000; // seconds
                        if (timeDiff > 0) {
                            const rxDiff = container.netRx - prev.rx;
                            const rxRate = Math.max(0, rxDiff / timeDiff);

                            const formatSpeed = (bytes: number) => {
                                if (bytes === 0) return '0 B/s';
                                const k = 1024;
                                const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
                                const i = Math.floor(Math.log(bytes) / Math.log(k));
                                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
                            };

                            // Only show download speed
                            netIO = `${formatSpeed(rxRate)}`;
                        }
                    }
                    // Update ref
                    prevDataRef.current[container.id] = { rx: container.netRx, time: now };
                }
                return { ...container, netIO };
            });

            setContainers(updatedContainers);
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
