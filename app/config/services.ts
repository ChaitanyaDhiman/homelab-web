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
        id: "plex",
        name: "Plex",
        description: "Media Server",
        url: process.env.NEXT_PUBLIC_SERVICE_PLEX_URL || "/unavailable?service=plex",
        icon: Server,
        category: "media",
        status: "online",
    },
    {
        id: "open-webui",
        name: "Open WebUI",
        description: "AI Chat Interface",
        url: process.env.NEXT_PUBLIC_SERVICE_OPENWEBUI_URL || "/unavailable?service=open-webui",
        icon: Activity,
        category: "ai",
        status: "online",
    },
    {
        id: "pihole",
        name: "Pi-hole",
        description: "Network Ad Blocker",
        url: process.env.NEXT_PUBLIC_SERVICE_PIHOLE_URL || "/unavailable?service=pihole",
        icon: Shield,
        category: "network",
        status: "online",
    },
    {
        id: "portainer",
        name: "Portainer",
        description: "Docker Management",
        url: process.env.NEXT_PUBLIC_SERVICE_PORTAINER_URL || "/unavailable?service=portainer",
        icon: Database,
        category: "system",
        status: "online",
    },
    {
        id: "home-assistant",
        name: "Home Assistant",
        description: "Home Automation",
        url: process.env.NEXT_PUBLIC_SERVICE_HASS_URL || "/unavailable?service=home-assistant",
        icon: Cloud,
        category: "system",
        status: "offline",
    },
    {
        id: "terminal",
        name: "Terminal",
        description: "Web Terminal",
        url: process.env.NEXT_PUBLIC_SERVICE_TERMINAL_URL || "/unavailable?service=terminal",
        icon: Terminal,
        category: "dev",
        status: "online"
    }
];
