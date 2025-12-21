import { Server, Activity, Database, Shield, Radio, Terminal, Cloud } from "lucide-react";

export interface Service {
    id: string;
    name: string;
    description: string;
    url: string;
    icon: any; // Lucide icon
    category: "media" | "system" | "dev" | "network" | "ai";
    status?: "online" | "offline" | "unknown";
}

export const services: Service[] = [
    {
        id: "jellyfin",
        name: "Jellyfin",
        description: "Media streaming server for movies, TV shows, and music",
        url: process.env.NEXT_PUBLIC_SERVICE_JELLYFIN_URL || "/unavailable?service=jellyfin",
        icon: Server,
        category: "media",
        status: "online",
    },
    {
        id: "open-webui",
        name: "Open WebUI",
        description: "AI chat interface with local LLM support via Ollama",
        url: process.env.NEXT_PUBLIC_SERVICE_OPENWEBUI_URL || "/unavailable?service=open-webui",
        icon: Activity,
        category: "ai",
        status: "online",
    },
    {
        id: "pihole",
        name: "Pi-hole",
        description: "Network-wide ad blocking and DNS management",
        url: process.env.NEXT_PUBLIC_SERVICE_PIHOLE_URL || "/unavailable?service=pihole",
        icon: Shield,
        category: "network",
        status: "online",
    },
    {
        id: "portainer",
        name: "Portainer",
        description: "Docker container management and monitoring",
        url: process.env.NEXT_PUBLIC_SERVICE_PORTAINER_URL || "/unavailable?service=portainer",
        icon: Database,
        category: "system",
        status: "online",
    },
    {
        id: "terminal",
        name: "Terminal",
        description: "Web Terminal",
        url: process.env.NEXT_PUBLIC_SERVICE_TERMINAL_URL || "/unavailable?service=terminal",
        icon: Terminal,
        category: "system",
        status: "online"
    },
    {
        id: "nginx-proxy-manager",
        name: "Nginx Proxy Manager",
        description: "Reverse Proxy",
        url: process.env.NEXT_PUBLIC_SERVICE_NPM_URL || "/unavailable?service=nginx-proxy-manager",
        icon: Cloud,
        category: "network",
        status: "online"
    }
];
