"use client";

import { SystemStatus } from "@/components/SystemStatus";
import { HealthSummary } from "@/components/dashboard/HealthSummary";
import { UpdateStatus } from '@/components/dashboard/SystemUpdateStatus';
import { StorageWidget } from '@/components/dashboard/StorageWidget';

export function HomeView() {
    return (
        <div className="flex flex-col min-h-full py-6 animate-in fade-in duration-500">
            <div className="mb-8">
                <SystemStatus />
            </div>

            <div className="mb-8">
                <UpdateStatus />
            </div>

            <div className="mb-8">
                <HealthSummary />
            </div>

            <div className="mb-8">
                <StorageWidget />
            </div>
        </div>
    );
}
