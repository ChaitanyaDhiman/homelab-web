"use client";

import { BaseWidget } from '../BaseWidget';
import { WidgetProps } from '@/app/types/widgets';
import { useEffect, useState } from 'react';
import { Clock as ClockIcon } from 'lucide-react';
import { useSettings } from '@/app/contexts/SettingsContext';

export function DateTimeWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { getEffectiveTimeFormat, dateFormat } = useSettings();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        const hour12 = getEffectiveTimeFormat() === '12h';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12
        });
    };

    const formatDate = (date: Date) => {
        if (dateFormat === 'auto') {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        const options: Intl.DateTimeFormatOptions =
            dateFormat === 'short' ? { month: 'numeric', day: 'numeric', year: '2-digit' } :
                dateFormat === 'medium' ? { month: 'short', day: 'numeric', year: 'numeric' } :
                    { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' };

        return date.toLocaleDateString('en-US', options);
    };

    return (
        <BaseWidget title={widget.type === 'datetime-minimal' ? '' : 'Date & Time'} isEditMode={isEditMode} onRemove={onRemove}>
            {/* Minimal Variant */}
            {widget.type === 'datetime-minimal' && (
                <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden">
                    <div className="text-3xl md:text-5xl font-bold text-white tabular-nums tracking-tight truncate w-full text-center">
                        {formatTime(currentTime)}
                    </div>
                </div>
            )}

            {/* Analog Variant (Simple CSS/SVG representation) */}
            {widget.type === 'datetime-analog' && (
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/5">
                        {/* Hour Hand */}
                        <div
                            className="absolute bg-white w-1.5 h-6 md:h-8 rounded-full origin-bottom bottom-1/2 left-[calc(50%-3px)]"
                            style={{ transform: `rotate(${(currentTime.getHours() % 12) * 30 + currentTime.getMinutes() * 0.5}deg)` }}
                        />
                        {/* Minute Hand */}
                        <div
                            className="absolute bg-primary w-1 h-10 md:h-12 rounded-full origin-bottom bottom-1/2 left-[calc(50%-2px)]"
                            style={{ transform: `rotate(${currentTime.getMinutes() * 6}deg)` }}
                        />
                        {/* Second Hand */}
                        <div
                            className="absolute bg-red-400 w-0.5 h-12 md:h-14 rounded-full origin-bottom bottom-1/2 left-[calc(50%-1px)]"
                            style={{ transform: `rotate(${currentTime.getSeconds() * 6}deg)` }}
                        />
                        {/* Center Dot */}
                        <div className="absolute w-3 h-3 bg-white rounded-full z-10" />
                    </div>
                    <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-400 truncate w-full text-center px-1">
                        {formatDate(currentTime)}
                    </div>
                </div>
            )}

            {/* Standard Variant */}
            {widget.type === 'datetime' && (
                <div className="flex flex-col items-center justify-center h-full space-y-2 md:space-y-4 w-full overflow-hidden">
                    <div className="flex items-center gap-2 md:gap-3">
                        <ClockIcon className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
                        <div className="text-3xl md:text-4xl font-bold text-white tabular-nums truncate">
                            {formatTime(currentTime)}
                        </div>
                    </div>
                    <div className="text-center w-full px-1">
                        <p className="text-sm md:text-lg text-gray-300 truncate">
                            {formatDate(currentTime)}
                        </p>
                    </div>
                </div>
            )}
        </BaseWidget>
    );
}
