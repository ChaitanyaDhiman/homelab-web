"use client";

import { Service } from "@/app/config/services";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
    service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
    const Icon = service.icon;

    const statusColor =
        service.status === "online" ? "bg-green-500" :
            service.status === "offline" ? "bg-red-500" : "bg-yellow-500";

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card group relative overflow-hidden rounded-xl p-6 transition-all"
        >
            <Link href={service.url} target="_blank" className="block h-full w-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                        <Icon className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <div className={`w-2 h-2 rounded-full ${statusColor} shadow-[0_0_10px_currentColor]`} />
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-white group-hover:text-[var(--primary)] transition-colors">
                        {service.name}
                    </h3>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 line-clamp-2">
                        {service.description}
                    </p>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                </div>

                {/* Glow effect on hover */}
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 -z-10" />
            </Link>
        </motion.div>
    );
}
