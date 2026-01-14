"use client";

import { Service } from "@/app/config/services";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { ServiceHealthIndicator } from "./dashboard/ServiceHealthIndicator";

interface ServiceCardProps {
    service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
    const Icon = service.icon;



    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card group relative overflow-hidden rounded-xl p-6 transition-all h-full"
        >
            <Link href={service.url} target="_blank" className="block h-full w-full relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                        <Icon className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                </div>

                <div className="absolute top-0 right-0">
                    <ServiceHealthIndicator serviceId={service.id} />
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-white group-hover:text-[var(--primary)] transition-colors">
                        {service.name}
                    </h3>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 line-clamp-2 pr-6">
                        {service.description}
                    </p>
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                </div>

                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 -z-10" />
            </Link>
        </motion.div>
    );
}
