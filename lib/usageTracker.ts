
const STORAGE_KEY = 'app_usage_stats';

interface UsageStats {
    [appId: string]: number;
}

export const usageTracker = {
    trackAppOpen: (appId: string) => {
        if (typeof window === 'undefined') return;

        try {
            const current: UsageStats = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            current[appId] = (current[appId] || 0) + 1;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        } catch (e) {
            console.error('Failed to track app usage:', e);
        }
    },

    getTopApps: (limit: number = 5): string[] => {
        if (typeof window === 'undefined') return [];

        try {
            const current: UsageStats = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return Object.entries(current)
                .sort(([, a], [, b]) => b - a)
                .slice(0, limit)
                .map(([id]) => id);
        } catch (e) {
            console.error('Failed to get top apps:', e);
            return [];
        }
    }
};
