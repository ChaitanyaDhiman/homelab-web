"use client";

import { useEffect, useState } from "react";
import { AppsConfig } from "@/app/types/apps";
import { AppTile } from "@/app/components/apps/AppTile";
import { motion } from "framer-motion";
import { Settings, Loader2 } from "lucide-react";

interface AppsViewProps {
    onNavigateToSettings: () => void;
}

export function AppsView({ onNavigateToSettings }: AppsViewProps) {
    const [config, setConfig] = useState<AppsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApps = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/apps");
            if (!response.ok) {
                throw new Error("Failed to fetch apps configuration");
            }
            const data = await response.json();
            setConfig(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-400">Loading apps...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <p className="text-red-400 mb-4">Error loading apps: {error}</p>
                <button
                    onClick={fetchApps}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const hasUncategorized = config?.uncategorizedApps && config.uncategorizedApps.length > 0;
    const hasCategories = config?.categories && config.categories.length > 0;

    if (!hasUncategorized && !hasCategories) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Settings className="w-12 h-12 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No Apps Configured</h2>
                <p className="text-gray-400 max-w-md mb-6">
                    Get started by adding your first app in the Apps Management settings.
                </p>
                <button
                    onClick={onNavigateToSettings}
                    className="px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Settings className="w-5 h-5" />
                    Manage Apps
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full py-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Apps</h1>
                    <p className="text-gray-400">Access your homelab applications</p>
                </div>
                <button
                    onClick={onNavigateToSettings}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center gap-2 border border-white/10"
                >
                    <Settings className="w-4 h-4" />
                    Manage Apps
                </button>
            </div>

            <div className="space-y-8 md:space-y-12">
                {/* Favorites Section */}
                {(() => {
                    // Collect all favorite apps
                    const favoriteApps = [
                        ...(config?.uncategorizedApps || []).filter(app => app.isFavorite),
                        ...(config?.categories || []).flatMap(cat => cat.apps.filter(app => app.isFavorite))
                    ];

                    if (favoriteApps.length === 0) return null;

                    return (
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-2xl">⭐</span>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                                    Favorites
                                </h2>
                                <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/30 to-transparent" />
                            </div>
                            <div className={`grid ${config?.tileSize === 'small'
                                ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'
                                : config?.tileSize === 'large'
                                    ? 'grid-cols-1 md:grid-cols-2 gap-6'
                                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                }`}>
                                {favoriteApps.map((app) => (
                                    <div key={app.id}>
                                        <AppTile app={app} tileSize={config?.tileSize} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })()}

                {/* Uncategorized Apps */}
                {hasUncategorized && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-white/60 uppercase tracking-wider">
                                Quick Access
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>
                        <div className={`grid ${config?.tileSize === 'small'
                            ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'
                            : config?.tileSize === 'large'
                                ? 'grid-cols-1 md:grid-cols-2 gap-6'
                                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            }`}>
                            {config!.uncategorizedApps!.map((app) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AppTile app={app} tileSize={config?.tileSize} />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Categorized Apps */}
                {hasCategories && config!.categories.map((category) => (
                    <section key={category.id} className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                                {category.name}
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>
                        {category.description && (
                            <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                        )}
                        <div className={`grid ${config?.tileSize === 'small'
                            ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'
                            : config?.tileSize === 'large'
                                ? 'grid-cols-1 md:grid-cols-2 gap-6'
                                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            }`}>
                            {category.apps.map((app) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AppTile app={app} tileSize={config?.tileSize} />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
