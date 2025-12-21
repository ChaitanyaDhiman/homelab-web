import { NextResponse } from 'next/server';
import { services } from '@/app/config/services';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ServiceStatus {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'degraded';
    responseTime?: number;
    statusCode?: number;
    lastChecked: string;
    error?: string;
}

interface HealthSummary {
    total: number;
    online: number;
    degraded: number;
    offline: number;
}

async function checkService(service: typeof services[0]): Promise<ServiceStatus> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const startTime = performance.now();

    try {
        // If URL is internal/unavailable, mark properly
        if (!service.url || service.url.startsWith('/') || service.url.includes('unavailable')) {
            // Ideally we might want to check if the internal route is accessible, but for external services
            // mapped to /unavailable, we can consider them offline or just 'not configured'
            // The requirement says "Handle services with missing/unconfigured URLs gracefully"
            // We'll treat them as offline but maybe with a specific note if possible, 
            // but strictly following requirements: return online/offline/degraded.
            // Let's mark unconfigured as offline for health check purposes so it shows up as needing attention.
            return {
                id: service.id,
                name: service.name,
                status: 'offline',
                lastChecked: new Date().toISOString(),
                error: 'Service URL not configured'
            };
        }

        // Hack for self-signed certs in development/homelab
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const response = await fetch(service.url, {
            method: 'GET', // Changed to GET as some services block HEAD
            signal: controller.signal,
            cache: 'no-store',
        });

        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        const isDegraded = responseTime > 2000;

        // Consider service online if we get a response, even if it's 401/403 (Auth required) or 405 (Method Not Allowed)
        // We expect 5xx errors to be actual failures.
        const isOnline = response.ok || [401, 403, 405].includes(response.status);

        clearTimeout(timeoutId);

        return {
            id: service.id,
            name: service.name,
            status: isOnline ? (isDegraded ? 'degraded' : 'online') : 'offline',
            responseTime,
            statusCode: response.status,
            lastChecked: new Date().toISOString(),
        };

    } catch (error) {
        clearTimeout(timeoutId);

        // Check if it's an SSL error (common in homelabs), consider online if so? 
        // Actually NODE_TLS_REJECT_UNAUTHORIZED='0' above should fix it.

        console.error(`Health check failed for ${service.name}:`, error);

        return {
            id: service.id,
            name: service.name,
            status: 'offline',
            lastChecked: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function GET() {
    const timestamp = new Date().toISOString();

    const results = await Promise.all(services.map(checkService));

    const summary: HealthSummary = {
        total: results.length,
        online: results.filter(s => s.status === 'online').length,
        degraded: results.filter(s => s.status === 'degraded').length,
        offline: results.filter(s => s.status === 'offline').length,
    };

    return NextResponse.json({
        success: true,
        timestamp,
        summary,
        services: results,
    });
}
