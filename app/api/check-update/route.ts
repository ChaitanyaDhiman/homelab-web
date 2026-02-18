import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

interface GitHubRelease {
    tag_name: string;
    html_url: string;
}

export async function GET() {
    try {
        const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;

        // If we can't determine current version, we can't check for updates
        if (!currentVersion) {
            return NextResponse.json({
                updateAvailable: false,
                currentVersion: 'unknown',
                latestVersion: null,
                error: 'Current version not found'
            });
        }

        const response = await fetch(process.env.NEXT_PUBLIC_GIT_URL + '/releases/latest', {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Homelab-Web-Update-Checker'
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            // If 404, it might mean no releases yet
            if (response.status === 404) {
                return NextResponse.json({
                    updateAvailable: false,
                    currentVersion,
                    latestVersion: currentVersion
                });
            }
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: GitHubRelease = await response.json();
        const latestVersionTag = data.tag_name; // e.g., "v1.0.1" or "1.0.1"

        // Normalize versions (remove 'v' prefix)
        const normalizedCurrent = currentVersion.replace(/^v/, '');
        const normalizedLatest = latestVersionTag.replace(/^v/, '');

        // Simple semantic version comparison
        // logical check: is latest > current?
        // We can use a simple string comparison if format is guaranteed, but let's be slightly robust
        const isUpdateAvailable = compareVersions(normalizedCurrent, normalizedLatest) < 0;

        return NextResponse.json({
            updateAvailable: isUpdateAvailable,
            currentVersion: currentVersion,
            latestVersion: latestVersionTag,
            url: data.html_url
        });

    } catch (error: any) {
        console.error('Update check failed:', error);
        return NextResponse.json({
            updateAvailable: false,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * Compare two semantic version strings.
 * Returns:
 * -1 if v1 < v2
 *  0 if v1 == v2
 *  1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
        const num1 = parts1[i] || 0;
        const num2 = parts2[i] || 0;

        if (num1 < num2) return -1;
        if (num1 > num2) return 1;
    }

    return 0;
}
