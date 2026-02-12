import fs from 'fs';
import path from 'path';
import { AppsConfig } from '@/types/apps';
import * as LucideIcons from 'lucide-react';

const APPS_CONFIG_PATH = path.join(process.cwd(), 'app/config/apps.json');

/**
 * Loads the apps configuration from the JSON file
 */
export function loadAppsConfig(): AppsConfig {
    try {
        if (!fs.existsSync(APPS_CONFIG_PATH)) {
            const defaultConfig = getDefaultConfig();
            saveAppsConfig(defaultConfig);
            return defaultConfig;
        }

        const fileContent = fs.readFileSync(APPS_CONFIG_PATH, 'utf-8');
        const config = JSON.parse(fileContent) as AppsConfig;

        // Resolve environment variables in URLs
        return resolveEnvVariables(config);
    } catch (error) {
        console.error('Error loading apps config:', error);
        return getDefaultConfig();
    }
}

/**
 * Saves the apps configuration to the JSON file
 */
export function saveAppsConfig(config: AppsConfig): void {
    try {
        const fileContent = JSON.stringify(config, null, 2);
        fs.writeFileSync(APPS_CONFIG_PATH, fileContent, 'utf-8');
    } catch (error) {
        console.error('Error saving apps config:', error);
        throw new Error('Failed to save apps configuration');
    }
}

/**
 * Resolves environment variables in the configuration
 */
function resolveEnvVariables(config: AppsConfig): AppsConfig {
    return {
        ...config,
        categories: config.categories.map(category => ({
            ...category,
            apps: category.apps.map(app => ({
                ...app,
                url: resolveEnvVar(app.url),
                healthCheckUrl: app.healthCheckUrl ? resolveEnvVar(app.healthCheckUrl) : undefined,
            })),
        })),
    };
}

/**
 * Resolves a single environment variable
 */
function resolveEnvVar(value: string): string {
    return value.replace(/\$\{([^}]+)\}/g, (_, varName) => {
        return process.env[varName] || `/unavailable?service=${varName}`;
    });
}

/**
 * Returns the default configuration
 */
function getDefaultConfig(): AppsConfig {
    return {
        categories: [],
    };
}

/**
 * Maps icon name to Lucide icon component
 */
export function getIconComponent(iconName: string): any {
    const icons = LucideIcons as any;
    return icons[iconName] || LucideIcons.Box;
}
