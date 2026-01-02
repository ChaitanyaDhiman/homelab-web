import { NextResponse } from 'next/server';
import { services } from '@/app/config/services';

export const dynamic = 'force-dynamic';

// Allow self-signed certificates for internal Docker health checks
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET() {
    const statusPromises = services.map(async (service) => {
        let envKey = `INTERNAL_SERVICE_${service.id.replace(/-/g, '').toUpperCase()}_URL`;
        // Special case handling if naming differs
        if (service.id === 'nginx-proxy-manager') envKey = 'INTERNAL_SERVICE_NPM_URL';

        const internalUrl = process.env[envKey];
        const targetUrl = internalUrl || service.url;

        if (!targetUrl || targetUrl.startsWith('/')) {
            console.log(`[Health] Skipping ${service.id}: No URL`);
            return { id: service.id, status: 'offline', responseTime: 0 };
        }

        const startTime = performance.now();
        let usedFallback = false;

        const tryCheck = async (url: string, timeoutMs: number) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);
            try {
                await fetch(url, {
                    method: 'GET',
                    cache: 'no-store',
                    signal: controller.signal,
                });
                return true;
            } finally {
                clearTimeout(id);
            }
        };

        try {
            try {
                // Attempt 1: Internal URL (Short 2s timeout for speed)
                await tryCheck(targetUrl, 2000);
            } catch (internalError) {
                // If Internal fails and differs from Public, try Public
                if (targetUrl !== service.url && service.url && !service.url.startsWith('/')) {
                    usedFallback = true;
                    // Attempt 2: Public URL (Remaining 3s timeout)
                    await tryCheck(service.url, 3000);
                } else {
                    throw internalError;
                }
            }

            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            const status = responseTime > 2000 ? 'degraded' : 'online';

            return { id: service.id, status, responseTime, fallback: usedFallback };
        } catch (error: any) {
            console.error(`[Health] Failed ${service.id}: ${error.message}`);
            return { id: service.id, status: 'offline', responseTime: 0, fallback: usedFallback };
        }
    });

    const results = await Promise.all(statusPromises);

    // Convert array to object map by ID
    const data = results.reduce((acc, curr) => {
        acc[curr.id] = {
            status: curr.status,
            responseTime: curr.responseTime,
            fallback: curr.fallback
        };
        return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ success: true, data });
}
