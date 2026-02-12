export interface App {
    id: string;
    name: string;
    description: string;
    url: string;
    icon: string; // Lucide icon name
    healthCheckUrl?: string;
    isFavorite?: boolean; // Mark app as favorite
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    apps: App[];
}

export interface AppsConfig {
    uncategorizedApps?: App[];
    categories: Category[];
    tileSize?: 'small' | 'medium' | 'large'; // Global tile size configuration
}
