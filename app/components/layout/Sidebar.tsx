"use client";

import { Home, LayoutGrid, BarChart2, Settings, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { NexLabIcon } from "@/app/components/icons/NexLabIcon";

export type TabId = 'home' | 'apps' | 'analytics' | 'settings';

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export function Sidebar({ activeTab, onTabChange, isExpanded, onToggleExpand }: SidebarProps) {
    // Auto-collapse on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768 && isExpanded) {
                onToggleExpand();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isExpanded, onToggleExpand]);

    // Check for updates
    const [updateAvailable, setUpdateAvailable] = useState(false);
    useEffect(() => {
        const checkUpdates = async () => {
            try {
                const res = await fetch('/api/check-update');
                const data = await res.json();
                if (data.updateAvailable) {
                    setUpdateAvailable(true);
                }
            } catch (err) {
                console.error('Failed to check for updates:', err);
            }
        };

        // Check on mount
        checkUpdates();

        // Re-check every hour
        const interval = setInterval(checkUpdates, 3600000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'apps', label: 'Apps', icon: LayoutGrid },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    return (
        <motion.div
            initial={false}
            animate={{ width: isExpanded ? 240 : 64 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative h-screen bg-background flex flex-col z-50 border-r border-white/5"
        >
            {/* Toggle / Header */}
            <motion.div layout className={`h-16 flex items-center ${isExpanded ? 'justify-between px-4' : 'justify-center'} mb-2 overflow-hidden`}>
                <AnimatePresence mode="wait">
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 whitespace-nowrap overflow-hidden"
                        >
                            <NexLabIcon className="w-8 h-8 text-primary shrink-0" />
                            <span className="text-xl font-bold text-white">NexLab</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.button
                    layout
                    onClick={onToggleExpand}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </motion.button>
            </motion.div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col gap-1 px-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="relative">
                            <motion.button
                                layout
                                onClick={() => onTabChange(item.id)}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={`
                                    relative w-full flex items-center py-3 rounded-lg transition-colors duration-200 group overflow-hidden
                                    ${isExpanded ? 'pl-[14px] pr-3' : 'pl-[14px]'} 
                                    ${isActive
                                        ? 'bg-surface-highlight text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <motion.div layout className="flex items-center justify-center shrink-0">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''} transition-colors`} />
                                </motion.div>

                                <AnimatePresence mode="wait">
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="ml-3 font-medium whitespace-nowrap overflow-hidden"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {!isExpanded && (
                                    <div className="absolute left-full ml-2 px-3 py-1.5 bg-surface-highlight rounded-md text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                        {item.label}
                                    </div>
                                )}
                            </motion.button>
                        </div>
                    );
                })}
            </div>

            {/* Version / Updates Footer */}
            <div className="p-3 border-t border-white/5">
                <div className={`flex items-center ${isExpanded ? 'justify-between px-2' : 'justify-center'} text-xs text-gray-500`}>
                    <AnimatePresence mode="wait">
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col"
                            >
                                <span className="font-medium">Version {process.env.NEXT_PUBLIC_APP_VERSION}</span>
                                {updateAvailable && (
                                    <a
                                        href="https://github.com/chaitanyadhiman/homelab-web/releases"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1 mt-0.5"
                                    >
                                        Update Available
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    </a>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isExpanded && updateAvailable && (
                        <div className="relative">
                            <span className="w-2 h-2 rounded-full bg-primary absolute -top-1 -right-1 animate-pulse" />
                            <Settings className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
