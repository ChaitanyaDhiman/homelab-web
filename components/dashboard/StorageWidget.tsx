'use client';

import { useEffect, useState } from 'react';
import { HardDrive, Server, Cloud, Film, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageDrives } from '@/app/config/storage';

interface DriveInfo {
    id: string;
    name: string;
    label: string;
    mount: string;
    total: number;
    used: number;
    available: number;
    percentage: number;
    icon: string;
    found: boolean;
}

interface StorageData {
    drives: DriveInfo[];
    totalDrives: number;
}

export function StorageWidget() {
    const [data, setData] = useState<StorageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const fetchStorage = async () => {
            try {
                const res = await fetch('/api/storage', { cache: 'no-store' });
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch storage:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStorage();
        const interval = setInterval(fetchStorage, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getStorageColor = (percentage: number) => {
        if (percentage >= 90) return 'red';
        if (percentage >= 80) return 'yellow';
        return 'green';
    };

    const getStorageIcon = (driveId: string) => {
        const configDrive = storageDrives.find(d => d.id === driveId);
        return configDrive?.icon || HardDrive;
    };

    if (loading) {
        return (
            <div className="glass-panel p-4 sm:p-6 rounded-2xl mb-8 flex items-center gap-3 sm:gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                    <HardDrive className="h-6 w-6 text-gray-400 animate-pulse" />
                </div>
                <div>
                    <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    // Calculate overall storage status
    const totalStorage = data.drives.reduce((acc, drive) => acc + drive.total, 0);
    const totalUsed = data.drives.reduce((acc, drive) => acc + drive.used, 0);
    const overallPercentage = totalStorage > 0 ? Math.round((totalUsed / totalStorage) * 100) : 0;
    const overallColor = getStorageColor(overallPercentage);

    return (
        <div
            className="glass-panel p-4 sm:p-6 rounded-2xl cursor-pointer transition-colors hover:bg-white/[0.07]"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                {/* Header Left */}
                <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 border ${overallColor === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        overallColor === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        <HardDrive className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-semibold text-white truncate">Storage Drives</h2>
                    </div>
                </div>

                {/* Header Right / Status */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto items-stretch sm:items-center">
                    <div className={`hidden md:flex items-center gap-2 pl-4 pr-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 cursor-default ${overallColor === 'green' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        overallColor === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        <span className="flex items-center gap-2">
                            {overallPercentage}% Used - {formatBytes(totalUsed)} / {formatBytes(totalStorage)}
                        </span>

                        <div className="hidden md:block h-4 w-px mx-1 bg-current opacity-20" />
                        <ChevronDown className={`hidden md:block w-4 h-4 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
                    </div>

                    <div className="text-gray-500 self-center sm:ml-2 md:hidden">
                        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-white/5 pl-0 sm:pl-2">
                            {/* Drives Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {data.drives.map((drive) => {
                                    const DriveIcon = getStorageIcon(drive.id);
                                    const driveColor = getStorageColor(drive.percentage);

                                    return (
                                        <div
                                            key={drive.id}
                                            className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${driveColor === 'green' ? 'bg-green-500/5 border-green-500/20' :
                                                driveColor === 'yellow' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                                    'bg-red-500/5 border-red-500/20'
                                                }`}
                                        >
                                            {/* Drive Header */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2 rounded-lg ${driveColor === 'green' ? 'bg-green-500/10 text-green-400' :
                                                    driveColor === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    <DriveIcon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white text-sm truncate">{drive.label}</h3>
                                                    <p className="text-xs text-gray-500 truncate">{drive.mount}</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-400">Used</span>
                                                    <span className={
                                                        driveColor === 'green' ? 'text-green-400' :
                                                            driveColor === 'yellow' ? 'text-yellow-400' :
                                                                'text-red-400'
                                                    }>
                                                        {drive.percentage}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${drive.percentage}%` }}
                                                        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                                                        className={`h-full rounded-full ${driveColor === 'green' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                                            driveColor === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                                                'bg-gradient-to-r from-red-400 to-red-500'
                                                            }`}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>{formatBytes(drive.used)}</span>
                                                    <span>{formatBytes(drive.total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Overall Summary */}
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Total Storage Across All Drives</span>
                                    <span className={
                                        overallColor === 'green' ? 'text-green-400' :
                                            overallColor === 'yellow' ? 'text-yellow-400' :
                                                'text-red-400'
                                    }>
                                        {overallPercentage}% Used
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${overallPercentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                        className={`h-full rounded-full ${overallColor === 'green' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                            overallColor === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                                'bg-gradient-to-r from-red-400 to-red-500'
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
