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
        id: "open-webui",
        name: "Open WebUI",
        description: "AI Chat Interface",
        url: process.env.NEXT_PUBLIC_SERVICE_OPENWEBUI_URL || "http://localhost:3000",
        icon: Activity,
        category: "ai",
        status: "online",
    },
    {
        id: "plex",
        name: "Plex",
        description: "Media Server",
        url: process.env.NEXT_PUBLIC_SERVICE_PLEX_URL || "http://localhost:32400/web",
        icon: Server,
        category: "media",
        status: "online",
    },
    {
        id: "pihole",
        name: "Pi-hole",
        description: "Network Ad Blocker",
        url: process.env.NEXT_PUBLIC_SERVICE_PIHOLE_URL || "http://pi.hole/admin",
        icon: Shield,
        category: "network",
        status: "unknown",
    },
    {
        id: "portainer",
        name: "Portainer",
        description: "Docker Management",
        url: process.env.NEXT_PUBLIC_SERVICE_PORTAINER_URL || "http://localhost:9000",
        icon: Database,
        category: "system",
        status: "online",
    },
    {
        id: "home-assistant",
        name: "Home Assistant",
        description: "Home Automation",
        url: process.env.NEXT_PUBLIC_SERVICE_HASS_URL || "http://homeassistant.local:8123",
        icon: Cloud,
        category: "system",
        status: "online",
    },
    {
        id: "terminal",
        name: "Terminal",
        description: "Web Terminal",
        url: process.env.NEXT_PUBLIC_SERVICE_TERMINAL_URL || "http://localhost:7681",
        icon: Terminal,
        category: "dev",
        status: "offline"
    }
];
