import { WidgetType, WidgetMetadata } from '@/types/widgets';
import {
    Clock,
    Cloud,
    Cpu,
    Download,
    Activity,
    HardDrive,
    Grip,
    Star,
    Gauge,
    PieChart,
    Box
} from 'lucide-react';

export const WIDGET_METADATA: Record<WidgetType, WidgetMetadata> = {
    'datetime': {
        type: 'datetime',
        name: 'Date & Time',
        description: 'Current date and time',
        category: 'Clock',
        singleton: true,
        icon: 'Clock',
        defaultSize: { w: 4, h: 2 },
        minSize: { w: 2, h: 2 }
    },
    'datetime-minimal': {
        type: 'datetime-minimal',
        name: 'Digital Clock',
        description: 'Minimal digital clock',
        category: 'Clock',
        singleton: true,
        icon: 'Clock',
        defaultSize: { w: 2, h: 2 },
        minSize: { w: 2, h: 2 }
    },
    'datetime-analog': {
        type: 'datetime-analog',
        name: 'Analog Clock',
        description: 'Analog clock face',
        category: 'Clock',
        singleton: true,
        icon: 'Clock',
        defaultSize: { w: 2, h: 2 },
        minSize: { w: 2, h: 2 }
    },
    'weather': {
        type: 'weather',
        name: 'Weather',
        description: 'Current weather conditions',
        category: 'Weather',
        singleton: true,
        icon: 'Cloud',
        defaultSize: { w: 4, h: 4 },
        minSize: { w: 2, h: 2 }
    },
    'system-stats': {
        type: 'system-stats',
        name: 'System Stats',
        description: 'CPU, GPU, temperature, uptime',
        category: 'System',
        singleton: true,
        icon: 'Cpu',
        defaultSize: { w: 6, h: 5 },
        minSize: { w: 2, h: 2 }
    },
    'updates': {
        type: 'updates',
        name: 'System Updates',
        description: 'Available system updates',
        category: 'System',
        singleton: true,
        icon: 'Download',
        defaultSize: { w: 4, h: 4 },
        minSize: { w: 2, h: 2 }
    },
    'service-health': {
        type: 'service-health',
        name: 'Service Health',
        description: 'App and service status overview',
        category: 'System',
        singleton: true,
        icon: 'Activity',
        defaultSize: { w: 4, h: 5 },
        minSize: { w: 2, h: 2 }
    },
    'storage': {
        type: 'storage',
        name: 'Storage',
        description: 'Storage drive usage',
        category: 'System',
        singleton: true,
        icon: 'HardDrive',
        defaultSize: { w: 6, h: 5 },
        minSize: { w: 2, h: 2 }
    },
    'app': {
        type: 'app',
        name: 'App',
        description: 'Shortcut to a specific application',
        category: 'Apps',
        singleton: false, // Can have multiple app widgets
        icon: 'Grip',
        defaultSize: { w: 2, h: 2 },
        minSize: { w: 1, h: 1 }
    },
    'frequent-apps': {
        type: 'frequent-apps',
        name: 'Frequent Apps',
        description: 'Your most used applications',
        category: 'Apps',
        singleton: true,
        icon: 'Star',
        defaultSize: { w: 4, h: 2 },
        minSize: { w: 2, h: 2 }
    },
    'cpu-gpu-gauge': {
        type: 'cpu-gpu-gauge',
        name: 'System Load',
        description: 'CPU & GPU Utilization Gauge',
        category: 'System',
        singleton: true,
        icon: 'Gauge',
        defaultSize: { w: 2, h: 2 },
        minSize: { w: 2, h: 2 }
    },
    'cpu-temp-circle': {
        type: 'cpu-temp-circle',
        name: 'CPU Monitor',
        description: 'CPU Usage & Temperature',
        category: 'System',
        singleton: true,
        icon: 'Cpu',
        defaultSize: { w: 2, h: 2 },
        minSize: { w: 2, h: 2 }
    },
    'gpu-temp-circle': {
        type: 'gpu-temp-circle',
        name: 'GPU Monitor',
        description: 'GPU Usage & Temperature',
        category: 'System',
        singleton: true,
        icon: 'Cpu',
        defaultSize: { w: 2, h: 2 },
        minSize: { w: 2, h: 2 }
    },
    'storage-bar': {
        type: 'storage-bar',
        name: 'Storage Bar',
        description: 'Combined storage usage',
        category: 'System',
        singleton: true,
        icon: 'HardDrive',
        defaultSize: { w: 4, h: 2 },
        minSize: { w: 2, h: 1 }
    },
    'storage-pie': {
        type: 'storage-pie',
        name: 'Storage Chart',
        description: 'Storage usage chart',
        category: 'System',
        singleton: true,
        icon: 'PieChart',
        defaultSize: { w: 2, h: 2 },
        minSize: { w: 2, h: 2 }
    },
    'network': {
        type: 'network',
        name: 'Network',
        description: 'Real-time traffic',
        category: 'System',
        singleton: true,
        icon: 'Activity',
        defaultSize: { w: 2, h: 2 },
        minSize: { w: 2, h: 2 }
    },
    'docker': {
        type: 'docker',
        name: 'Docker Containers',
        description: 'Container status & stats',
        category: 'System',
        singleton: true,
        icon: 'Box',
        defaultSize: { w: 6, h: 4 },
        minSize: { w: 4, h: 2 }
    }
};

export const getWidgetIcon = (type: WidgetType) => {
    const iconMap = {
        'datetime': Clock,
        'datetime-minimal': Clock,
        'datetime-analog': Clock,
        'weather': Cloud,
        'system-stats': Cpu,
        'updates': Download,
        'service-health': Activity,
        'storage': HardDrive,
        'app': Grip,
        'frequent-apps': Star,
        'cpu-gpu-gauge': Gauge,
        'cpu-temp-circle': Cpu,
        'gpu-temp-circle': Cpu,
        'storage-bar': HardDrive,
        'storage-pie': PieChart,
        'network': Activity,
        'docker': Box
    };
    return iconMap[type];
};
