import { Server, Cloud, Film, HardDrive, Database, FolderOpen } from "lucide-react";

export interface StorageDrive {
    id: string;
    name: string;
    label: string;
    mount: string;  // Mount point to look for (e.g., '/', '/mnt/media')
    icon: any;      // Lucide icon
    fallback?: {
        // Optional fallback values if mount is not found
        total: number;
        used: number;
        percentage: number;
    };
}

export const storageDrives: StorageDrive[] = [
    {
        id: "main",
        name: "main",
        label: "Main Storage",
        mount: "/",
        icon: Server,
    },
    {
        id: "cloud",
        name: "cloud",
        label: "Cloud Storage",
        mount: "/mnt/cloud",  // Change this to your actual cloud mount point
        icon: Cloud,
    },
    {
        id: "media",
        name: "media",
        label: "Media Storage",
        mount: "/mnt/media",  // Change this to your actual media mount point
        icon: Film,
    },
    {
        id: "backup",
        name: "backup",
        label: "Backup Storage",
        mount: "/mnt/backup",  // Change this to your actual backup mount point
        icon: HardDrive,
    }
];
