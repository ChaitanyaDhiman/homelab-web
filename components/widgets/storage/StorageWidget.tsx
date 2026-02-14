"use client";

import { BaseWidget } from '../BaseWidget';
import { WidgetProps } from '@/types/widgets';
import { useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';

interface StorageDrive {
    name: string;
    label?: string;
    mount: string;
    used: number;
    total: number;
    percentage: number;
    found?: boolean;
}

export function StorageWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const [drives, setDrives] = useState<StorageDrive[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStorage = async () => {
            try {
                const response = await fetch('/api/storage');
                if (!response.ok) throw new Error('Failed to fetch storage');
                const result = await response.json();
                // Filter out drives that are not found (invalid configuration)
                // They will still be visible in Settings for fixing
                const validDrives = (result.data?.drives || []).filter((d: any) => d.found !== false);
                setDrives(validDrives);
            } catch (error) {
                console.error('Error fetching storage:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStorage();
        const interval = setInterval(fetchStorage, 60000);

        return () => clearInterval(interval);
    }, []);

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <BaseWidget title="Storage" isEditMode={isEditMode} onRemove={onRemove}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </BaseWidget>
        );
    }

    return (
        <BaseWidget title="Storage" isEditMode={isEditMode} onRemove={onRemove}>
            <div className="space-y-4">
                {drives.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <HardDrive className="w-8 h-8 text-gray-500 mb-2" />
                        <p className="text-sm text-gray-400">No storage drives configured</p>
                    </div>
                ) : (
                    drives.map((drive, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-white">{drive.label || drive.name}</span>
                                </div>
                                <span className="text-xs text-gray-400">{drive.percentage}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(drive.percentage)}`}
                                    style={{ width: `${drive.percentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{formatBytes(drive.used)} used</span>
                                <span>{formatBytes(drive.total)} total</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </BaseWidget>
    );
}
