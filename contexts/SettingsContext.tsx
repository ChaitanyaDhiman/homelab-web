'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TimeFormat = 'auto' | '12h' | '24h';
type DateFormat = 'auto' | 'short' | 'medium' | 'long';
type Theme = 'auto' | 'light' | 'dark';

interface SettingsContextType {
    timeFormat: TimeFormat;
    setTimeFormat: (format: TimeFormat) => void;
    dateFormat: DateFormat;
    setDateFormat: (format: DateFormat) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    getEffectiveTimeFormat: () => '12h' | '24h';
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [timeFormat, setTimeFormatState] = useState<TimeFormat>('auto');
    const [dateFormat, setDateFormatState] = useState<DateFormat>('auto');
    const [theme, setThemeState] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTimeFormat = localStorage.getItem('timeFormat') as TimeFormat;
        const savedDateFormat = localStorage.getItem('dateFormat') as DateFormat;
        const savedTheme = localStorage.getItem('theme') as Theme;

        if (savedTimeFormat === 'auto' || savedTimeFormat === '12h' || savedTimeFormat === '24h') {
            setTimeFormatState(savedTimeFormat);
        }
        if (savedDateFormat === 'auto' || savedDateFormat === 'short' || savedDateFormat === 'medium' || savedDateFormat === 'long') {
            setDateFormatState(savedDateFormat);
        }
        if (savedTheme === 'auto' || savedTheme === 'light' || savedTheme === 'dark') {
            setThemeState(savedTheme);
        }
    }, []);

    const setTimeFormat = (format: TimeFormat) => {
        setTimeFormatState(format);
        if (mounted) {
            localStorage.setItem('timeFormat', format);
        }
    };

    const setDateFormat = (format: DateFormat) => {
        setDateFormatState(format);
        if (mounted) {
            localStorage.setItem('dateFormat', format);
        }
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        if (mounted) {
            localStorage.setItem('theme', newTheme);
        }
    };

    useEffect(() => {
        if (!mounted) return;

        const applyTheme = () => {
            let effectiveTheme: 'light' | 'dark' = 'dark';

            if (theme === 'auto') {
                effectiveTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
            } else {
                effectiveTheme = theme;
            }

            if (effectiveTheme === 'light') {
                document.documentElement.classList.add('light-theme');
                document.documentElement.classList.remove('dark-theme');
            } else {
                document.documentElement.classList.add('dark-theme');
                document.documentElement.classList.remove('light-theme');
            }
        };

        applyTheme();

        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
            const handleChange = () => applyTheme();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme, mounted]);

    const getEffectiveTimeFormat = (): '12h' | '24h' => {
        if (timeFormat !== 'auto') {
            return timeFormat;
        }

        const testDate = new Date(2000, 0, 1, 13, 0, 0);
        const formatted = testDate.toLocaleTimeString();
        return formatted.includes('PM') || formatted.includes('AM') ? '12h' : '24h';
    };

    return (
        <SettingsContext.Provider value={{
            timeFormat,
            setTimeFormat,
            dateFormat,
            setDateFormat,
            theme,
            setTheme,
            getEffectiveTimeFormat
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
