import { Server, Activity, Database, Shield, Radio, Gauge, Cloud, Brain, File, HardDrive, Camera } from "lucide-react";
import { OllamaIcon } from "@/components/icons/OllamaIcon";

export interface Service {
    id: string;
    name: string;
    description: string;
    url: string;
    icon: any; // Lucide icon
    category: "media" | "system" | "dev" | "network" | "ai" | "storage";
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
        id: "plex",
        name: "Plex",
        description: "Media streaming server for movies, TV shows, and music",
        url: process.env.NEXT_PUBLIC_SERVICE_PLEX_URL || "/unavailable?service=plex",
        icon: Server,
        category: "media",
        status: "online",
    },
    {
        id: "open-webui",
        name: "Open WebUI",
        description: "AI chat interface with local LLM support via Ollama",
        url: process.env.NEXT_PUBLIC_SERVICE_OPENWEBUI_URL || "/unavailable?service=open-webui",
        icon: OllamaIcon,
        category: "ai",
        status: "online",
    },
    {
        id: "filebrowser",
        name: "File Browser",
        description: "Filebrowser is a web-based file manager for your files",
        url: process.env.NEXT_PUBLIC_SERVICE_FILEBROWSER_URL || "/unavailable?service=filebrowser",
        icon: HardDrive,
        category: "storage",
        status: "online",
    },
    {
        id: "immich",
        name: "Immich",
        description: "Immich is a self-hosted photo and video management solution",
        url: process.env.NEXT_PUBLIC_SERVICE_IMMICH_URL || "/unavailable?service=immich",
        icon: Camera,
        category: "media",
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
        id: "cockpit",
        name: "Cockpit",
        description: "Cockpit is a web-based graphical interface for servers",
        url: process.env.NEXT_PUBLIC_SERVICE_COCKPIT_URL || "/unavailable?service=cockpit",
        icon: Gauge,
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
