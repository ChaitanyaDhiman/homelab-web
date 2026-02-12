export interface StorageDrive {
    id: string;
    name: string;
    label: string;
    mount: string;
    icon: string; // Lucide icon name
    fallback?: {
        total: number;
        used: number;
        percentage: number;
    };
}

export interface StorageConfig {
    drives: StorageDrive[];
}
