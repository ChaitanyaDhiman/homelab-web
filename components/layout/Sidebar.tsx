"use client";

import { Home, LayoutGrid, BarChart2, Settings, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { NexLabIcon } from "@/components/icons/NexLabIcon";

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
            className="relative h-screen bg-background flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-white/5"
        >
            {/* Toggle / Header */}
            <div className={`h-16 flex items-center ${isExpanded ? 'justify-between px-4' : 'justify-center'} mb-2`}>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-3"
                        >
                            <NexLabIcon className="w-8 h-8 text-primary" />
                            <span className="text-xl font-bold text-white">NexLab</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={onToggleExpand}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col gap-1 px-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="relative">
                            <button
                                onClick={() => onTabChange(item.id)}
                                className={`
                                    relative w-full flex items-center ${isExpanded ? 'px-3' : 'justify-center'} py-3 rounded-lg transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-surface-highlight text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''} transition-colors`} />

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="ml-3 font-medium whitespace-nowrap"
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
                            </button>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
