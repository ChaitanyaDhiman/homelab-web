"use client";

import { ReactNode } from 'react';
import { X, GripVertical } from 'lucide-react';

interface BaseWidgetProps {
    title?: string;
    children: ReactNode;
    isEditMode?: boolean;
    onRemove?: () => void;
    actions?: ReactNode;
    className?: string;
}

export function BaseWidget({
    title,
    children,
    isEditMode = false,
    onRemove,
    actions,
    className = ''
}: BaseWidgetProps) {
    return (
        <div className={`glass-card h-full flex flex-col relative ${className}`}>
            {/* Header */}
            {(title || isEditMode) && (
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {isEditMode && (
                            <div className="drag-handle cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-4 h-4 text-gray-500" />
                            </div>
                        )}
                        {title && (
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                {title}
                            </h3>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {actions}
                        {isEditMode && onRemove && (
                            <button
                                onClick={onRemove}
                                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                                title="Remove widget"
                            >
                                <X className="w-4 h-4 text-red-400" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}
