"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UnavailableContent() {
    const searchParams = useSearchParams();
    const service = searchParams.get("service");

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
            <div className="glass-panel p-12 rounded-2xl max-w-md w-full flex flex-col items-center space-y-6 animate-float">
                <div className="p-4 rounded-full bg-red-500/10">
                    <AlertTriangle className="w-16 h-16 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">Service Unavailable</h1>
                    <p className="text-gray-400">
                        The service <span className="text-[var(--primary)] font-mono">{service || "requested"}</span> is currently not configured or unreachable.
                    </p>
                </div>

                <Link
                    href="/"
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Return to Dashboard</span>
                </Link>
            </div>
        </div>
    );
}

export default function UnavailablePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
            <UnavailableContent />
        </Suspense>
    );
}
