export type WidgetType =
    | 'datetime'
    | 'datetime-minimal'
    | 'datetime-analog'
    | 'weather'
    | 'system-stats'
    | 'updates'
    | 'service-health'
    | 'storage'
    | 'app'
    | 'frequent-apps'
    | 'cpu-gpu-gauge'
    | 'cpu-temp-circle'
    | 'gpu-temp-circle'
    | 'storage-bar'
    | 'storage-pie'
    | 'network'
    | 'docker';

export interface WidgetLayout {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
}

export interface Widget {
    id: string;
    type: WidgetType;
    layout: WidgetLayout;
    config?: Record<string, unknown>;
}

export interface WidgetConfig {
    widgets: Widget[];
    userName?: string;
}

export interface WidgetMetadata {
    type: WidgetType;
    name: string;
    description: string;
    category: string; // New field for grouping
    singleton?: boolean; // If true, only one instance allowed
    icon: string;
    defaultSize: {
        w: number;
        h: number;
    };
    minSize?: {
        w: number;
        h: number;
    };
}

export interface WidgetProps {
    widget: Widget;
    isEditMode?: boolean;
    onRemove?: () => void;
    onUpdateConfig?: (config: Record<string, unknown>) => void;
}
