import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';
import { ComponentType } from 'react';

/**
 * Maps icon name to Lucide icon component (client-side safe)
 */
export function getIconComponent(iconName: string): ComponentType<LucideProps> {
    const icons = LucideIcons as unknown as Record<string, ComponentType<LucideProps>>;
    return icons[iconName] || LucideIcons.Box;
}
