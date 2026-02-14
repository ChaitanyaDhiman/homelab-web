"use client";

import { BaseWidget } from '../BaseWidget';
import { WidgetProps } from '@/types/widgets';
import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, CloudFog, CloudLightning } from 'lucide-react';

interface WeatherData {
    temperature: number;
    description: string;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
    isDay: boolean;
    location: string;
}

export function WeatherWidget({ widget, isEditMode, onRemove }: WidgetProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Weather code mapping (WMO code)
    const getWeatherDescription = (code: number) => {
        if (code === 0) return 'Clear sky';
        if (code === 1 || code === 2 || code === 3) return 'Mainly clear, partly cloudy';
        if (code === 45 || code === 48) return 'Fog';
        if (code >= 51 && code <= 55) return 'Drizzle';
        if (code >= 56 && code <= 57) return 'Freezing Drizzle';
        if (code >= 61 && code <= 65) return 'Rain';
        if (code >= 66 && code <= 67) return 'Freezing Rain';
        if (code >= 71 && code <= 75) return 'Snow fall';
        if (code === 77) return 'Snow grains';
        if (code >= 80 && code <= 82) return 'Rain showers';
        if (code >= 85 && code <= 86) return 'Snow showers';
        if (code >= 95) return 'Thunderstorm';
        return 'Unknown';
    };

    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                // Fetch weather
                const weatherPromise = fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&temperature_unit=celsius`
                );

                // Fetch location name (Reverse Geocoding)
                const locationPromise = fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
                );

                const [weatherRes, locationRes] = await Promise.all([weatherPromise, locationPromise]);

                if (!weatherRes.ok) throw new Error('Failed to fetch weather');

                const weatherData = await weatherRes.json();
                const locationData = await locationRes.json();

                const current = weatherData.current;
                const locationName = locationData.locality || locationData.city || locationData.principalSubdivision || 'Unknown Location';

                setWeather({
                    temperature: Math.round(current.temperature_2m),
                    description: getWeatherDescription(current.weather_code),
                    weatherCode: current.weather_code,
                    windSpeed: current.wind_speed_10m,
                    humidity: current.relative_humidity_2m,
                    isDay: current.is_day === 1,
                    location: locationName
                });
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Failed to load weather');
            } finally {
                setLoading(false);
            }
        };

        const getLocationAndFetch = () => {
            setLoading(true);
            if (!navigator.geolocation) {
                setError('Geolocation not supported');
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    setError('Location access denied');
                    setLoading(false);
                }
            );
        };

        getLocationAndFetch();

        // Refresh every 15 minutes
        const interval = setInterval(getLocationAndFetch, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getWeatherIcon = (code: number, isDay: boolean) => {
        if (code === 0) return isDay ? Sun : Cloud; // Clear
        if (code >= 1 && code <= 3) return Cloud; // Cloudy
        if (code === 45 || code === 48) return CloudFog; // Fog
        if (code >= 51 && code <= 67) return CloudRain; // Rain/Drizzle
        if (code >= 71 && code <= 86) return CloudSnow; // Snow
        if (code >= 95) return CloudLightning; // Thunderstorm
        return Sun;
    };

    return (
        <BaseWidget title="Weather" isEditMode={isEditMode} onRemove={onRemove}>
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Cloud className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-xs text-primary mt-2 hover:underline"
                    >
                        Retry
                    </button>
                </div>
            ) : weather ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                    <div className="flex items-center gap-4">
                        {(() => {
                            const Icon = getWeatherIcon(weather.weatherCode, weather.isDay);
                            return <Icon className="w-12 h-12 text-primary" />;
                        })()}
                        <div className="text-4xl font-bold text-white">
                            {weather.temperature}°
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-200">{weather.description}</p>
                        <p className="text-sm text-gray-400 mb-2">{weather.location}</p>
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <Wind className="w-3 h-3" />
                                {weather.windSpeed} km/h
                            </span>
                            <span className="flex items-center gap-1">
                                <CloudDrizzle className="w-3 h-3" />
                                {weather.humidity}%
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}
        </BaseWidget>
    );
}
