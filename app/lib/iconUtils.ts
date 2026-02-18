import * as LucideIcons from 'lucide-react';

import { LucideProps } from 'lucide-react';
import { ComponentType, createElement } from 'react';
import Image from 'next/image';
import { NexLabIcon } from '@/app/components/icons/NexLabIcon';
import { OllamaIcon } from '@/app/components/icons/OllamaIcon';

// Map of custom icons
const CUSTOM_ICONS: Record<string, ComponentType<LucideProps>> = {
    NexLabIcon,
    OllamaIcon,
};

/**
 * Maps icon name to Lucide icon component, custom icon, or URL image
 */
export function getIconComponent(iconName: string): ComponentType<LucideProps> {
    if (!iconName) return LucideIcons.Box;

    const cleanName = iconName.trim();

    // 1. Check for URL (http/https), relative path (/), Data URI (data:), or raw SVG (<svg)
    if (cleanName.startsWith('http://') ||
        cleanName.startsWith('https://') ||
        cleanName.startsWith('/') ||
        cleanName.startsWith('data:') ||
        cleanName.startsWith('<svg')) {

        let src = cleanName;
        // Auto-convert raw SVG to Data URI
        if (cleanName.startsWith('<svg')) {
            src = `data:image/svg+xml;utf8,${encodeURIComponent(cleanName)}`;
        }

        const UrlIcon = (props: LucideProps) => (
            createElement('div', { className: `relative ${props.className}`, style: { width: props.size || '1em', height: props.size || '1em' } },
                createElement(Image, {
                    src: src,
                    alt: "App Icon",
                    fill: true,
                    className: "object-contain",
                    unoptimized: true
                })
            )
        );
        UrlIcon.displayName = 'UrlIcon';
        return UrlIcon;
    }

    // 2. Check custom icons
    if (CUSTOM_ICONS[cleanName]) {
        return CUSTOM_ICONS[cleanName];
    }

    // 3. Check Lucide icons
    // Handle potential whitespace in lucide icon names too
    const icons = LucideIcons as unknown as Record<string, ComponentType<LucideProps>>;
    return icons[cleanName] || LucideIcons.Box;
}
