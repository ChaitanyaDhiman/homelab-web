
export type StorageDrive = DriveInfo;

export interface DriveInfo {
    id: string;
    name: string;
    label: string;
    mount: string;
    total: number;
    used: number;
    available: number;
    percentage: number;
    icon: string;
    found: boolean;
    fallback?: {
        total: number;
        used: number;
        percentage: number;
    };
}

export interface StorageDriveConfig {
    id: string;
    name: string;
    label: string;
    mount: string;
    icon?: string;
    fallback?: {
        total: number;
        used: number;
        percentage: number;
    };
}

export interface StorageConfig {
    drives: StorageDriveConfig[];
}

export interface StorageData {
    drives: DriveInfo[];
    totalDrives: number;
}
