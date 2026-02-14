"use client";

import { BaseWidget } from '../BaseWidget';
import { WidgetProps } from '@/types/widgets';
import { useEffect, useState } from 'react';
import { Download, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface UpdateData {
    available: number;
    security: number;
    rebootRequired: boolean;
}

export function UpdatesWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const [updates, setUpdates] = useState<UpdateData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const response = await fetch('/api/updates');
                if (!response.ok) throw new Error('Failed to fetch updates');
                const data = await response.json();
                setUpdates({
                    available: data.available || 0,
                    security: data.security || 0,
                    rebootRequired: data.rebootRequired || false
                });
            } catch (error) {
                console.error('Error fetching updates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpdates();
        const interval = setInterval(fetchUpdates, 300000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <BaseWidget title="Updates" isEditMode={isEditMode} onRemove={onRemove}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </BaseWidget>
        );
    }

    const hasUpdates = updates && updates.available > 0;

    return (
        <BaseWidget title="System Updates" isEditMode={isEditMode} onRemove={onRemove}>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                {hasUpdates ? (
                    <>
                        <div className="flex items-center gap-3">
                            <Download className="w-12 h-12 text-yellow-400" />
                            <div className="text-5xl font-bold text-white">
                                {updates.available}
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-lg text-gray-300">
                                {updates.available === 1 ? 'Update' : 'Updates'} Available
                            </p>
                            {updates.security > 0 && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-sm text-red-400">
                                        {updates.security} Security
                                    </span>
                                </div>
                            )}
                            {updates.rebootRequired && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 rounded-full">
                                    <RefreshCw className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm text-orange-400">
                                        Reboot Required
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-400" />
                        <div className="text-center">
                            <p className="text-lg text-gray-300">System Up to Date</p>
                            <p className="text-sm text-gray-500 mt-1">No updates available</p>
                        </div>
                    </>
                )}
            </div>
        </BaseWidget>
    );
}
