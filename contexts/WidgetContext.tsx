"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Widget, WidgetConfig } from '@/types/widgets';

interface WidgetContextType {
    config: WidgetConfig | null;
    isEditMode: boolean;
    loading: boolean;
    setEditMode: (enabled: boolean) => void;
    addWidget: (widget: Widget) => void;
    removeWidget: (widgetId: string) => void;
    updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
    updateLayout: (widgets: Widget[]) => void;
    saveConfig: () => Promise<void>;
    refreshConfig: () => Promise<void>;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<WidgetConfig | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/widgets');
            if (!response.ok) throw new Error('Failed to fetch widget config');
            const data = await response.json();

            // Sanitize any null y values from the config
            if (data.widgets) {
                data.widgets = data.widgets.map((w: Widget) => ({
                    ...w,
                    layout: {
                        ...w.layout,
                        y: w.layout.y ?? 0,
                    }
                }));
            }

            setConfig(data);
        } catch (error) {
            console.error('Error fetching widget config:', error);
            setConfig({ widgets: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const setEditMode = (enabled: boolean) => {
        setIsEditMode(enabled);
    };

    const addWidget = (widget: Widget) => {
        if (!config) return;

        // Calculate the next available y position to avoid overlap
        let maxY = 0;
        for (const w of config.widgets) {
            const bottom = (w.layout.y ?? 0) + w.layout.h;
            if (bottom > maxY) maxY = bottom;
        }

        const newWidget = {
            ...widget,
            layout: {
                ...widget.layout,
                x: 0,
                y: maxY, // Place below all existing widgets
            }
        };

        const newConfig = {
            ...config,
            widgets: [...config.widgets, newWidget]
        };

        setConfig(newConfig);

        // Auto-save when adding a widget
        saveConfigData(newConfig);
    };

    const removeWidget = (widgetId: string) => {
        if (!config) return;

        const newConfig = {
            ...config,
            widgets: config.widgets.filter(w => w.id !== widgetId)
        };

        setConfig(newConfig);

        // Auto-save when removing a widget
        saveConfigData(newConfig);
    };

    const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
        if (!config) return;
        const newConfig = {
            ...config,
            widgets: config.widgets.map(w =>
                w.id === widgetId ? { ...w, ...updates } : w
            )
        };
        setConfig(newConfig);
        saveConfigData(newConfig);
    };

    const updateLayout = (widgets: Widget[]) => {
        if (!config) return;
        const newConfig = {
            ...config,
            widgets
        };
        setConfig(newConfig);
        saveConfigData(newConfig);
    };

    const saveConfigData = async (configToSave: WidgetConfig) => {
        try {
            // Sanitize before saving — ensure no null/Infinity y values
            const sanitized = {
                ...configToSave,
                widgets: configToSave.widgets.map(w => ({
                    ...w,
                    layout: {
                        ...w.layout,
                        y: (w.layout.y === null || w.layout.y === undefined || !isFinite(w.layout.y))
                            ? 0
                            : w.layout.y,
                    }
                }))
            };

            const response = await fetch('/api/widgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitized)
            });

            if (!response.ok) throw new Error('Failed to save widget config');
        } catch (error) {
            console.error('Error saving widget config:', error);
            throw error;
        }
    };

    const saveConfig = async () => {
        if (!config) return;
        await saveConfigData(config);
    };

    const refreshConfig = async () => {
        await fetchConfig();
    };

    return (
        <WidgetContext.Provider
            value={{
                config,
                isEditMode,
                loading,
                setEditMode,
                addWidget,
                removeWidget,
                updateWidget,
                updateLayout,
                saveConfig,
                refreshConfig
            }}
        >
            {children}
        </WidgetContext.Provider>
    );
}

export function useWidgets() {
    const context = useContext(WidgetContext);
    if (context === undefined) {
        throw new Error('useWidgets must be used within a WidgetProvider');
    }
    return context;
}
