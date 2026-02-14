# How to Add a New Widget

This guide explains the process of adding a new widget to the dashboard.

## Overview

Adding a widget involves 3 main steps:
1.  **Create the Widget Component**: The React component that renders the widget.
2.  **Register Metadata**: Define the widget's properties (name, size, category) in the registry.
3.  **Map the Component**: Link the type string to the actual component.

## Step-by-Step Guide

### 1. Create the Widget Component

Create a new directory in `components/widgets/` for your widget (e.g., `components/widgets/mytime/`).
Create a file `MyTimeWidget.tsx`.

It must accept `WidgetProps` and wrap its content in `BaseWidget`.

```tsx
// components/widgets/mytime/MyTimeWidget.tsx
import { BaseWidget } from '@/components/widgets/BaseWidget';
import { WidgetProps } from '@/types/widgets';

export function MyTimeWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    return (
        <BaseWidget 
            title="My Time" 
            isEditMode={isEditMode} 
            onRemove={onRemove}
        >
            <div className="flex items-center justify-center h-full">
                <h1 className="text-2xl font-bold text-white">Hello World</h1>
            </div>
        </BaseWidget>
    );
}
```

### 2. Update Widget Types

Add your new widget type string to `types/widgets.ts`.

```typescript
// types/widgets.ts
export type WidgetType = 
    | 'datetime' 
    | 'weather' 
    | 'my-time'; // Add your type here
```

### 3. Register Metadata

Add the widget's metadata to `lib/widgetRegistry.ts`. This controls how it appears in the "Add Widget" picker.

```typescript
// lib/widgetRegistry.ts
export const WIDGET_METADATA: Record<WidgetType, WidgetMetadata> = {
    // ... other widgets
    'my-time': {
        type: 'my-time',
        name: 'My Time',
        description: 'A custom time widget',
        category: 'Time', // This puts it in the "Time" category sidebar
        singleton: false, // Set to true if only one instance should be allowed
        icon: 'Clock', // Lucide icon name
        defaultSize: { w: 4, h: 3 },
        minSize: { w: 2, h: 2 }
    }
};
```

### 4. Map the Component

Finally, map the type string to the component in `components/home/WidgetGrid.tsx`.

```tsx
// components/home/WidgetGrid.tsx
import { MyTimeWidget } from '@/components/widgets/mytime/MyTimeWidget';

const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType<any>> = {
    // ...
    'my-time': MyTimeWidget,
};
```

## Icons
To add a new icon support, update `getWidgetIcon` in `lib/widgetRegistry.ts` if the icon isn't already imported/mapped.

## That's it!
Your widget will now appear in the "Add Widget" picker under the category you specified.
