"use client";

import { services } from "@/app/config/services";
import { ServiceCard } from "./ServiceCard";
import { motion } from "framer-motion";

export function DashboardGrid() {
    const categories = Array.from(new Set(services.map((s) => s.category)));

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-12">
            {categories.map((category) => (
                <section key={category} className="space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xl font-bold uppercase tracking-wider text-white/50 border-b border-white/5 pb-2 ml-1"
                    >
                        {category}
                    </motion.h2>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {services
                            .filter((s) => s.category === category)
                            .map((service) => (
                                <motion.div key={service.id} variants={item}>
                                    <ServiceCard service={service} />
                                </motion.div>
                            ))}
                    </motion.div>
                </section>
            ))}
        </div>
    );
}
