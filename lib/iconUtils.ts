import * as LucideIcons from 'lucide-react';

/**
 * Maps icon name to Lucide icon component (client-side safe)
 */
export function getIconComponent(iconName: string): any {
    const icons = LucideIcons as any;
    return icons[iconName] || LucideIcons.Box;
}
