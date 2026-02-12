"use client";

import { BarChart2 } from "lucide-react";

export function AnalyticsView() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <BarChart2 className="w-12 h-12 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
            <p className="text-gray-400 max-w-md">
                System performance metrics and historical data will be displayed here soon.
            </p>
        </div>
    );
}
