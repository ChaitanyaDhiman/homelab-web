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
    // 1. Check for URL (http/https)
    if (iconName.startsWith('http://') || iconName.startsWith('https://')) {
        const UrlIcon = (props: LucideProps) => (
            createElement('div', { className: `relative ${props.className}`, style: { width: props.size || '1em', height: props.size || '1em' } },
                createElement(Image, {
                    src: iconName,
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
    if (CUSTOM_ICONS[iconName]) {
        return CUSTOM_ICONS[iconName];
    }

    // 3. Check Lucide icons
    const icons = LucideIcons as unknown as Record<string, ComponentType<LucideProps>>;
    return icons[iconName] || LucideIcons.Box;
}
