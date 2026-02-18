"use client";

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useApps } from '@/app/hooks/useApps';
import { usageTracker } from '@/app/lib/usageTracker';
import { useRouter } from 'next/navigation';

export function SearchBar() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { apps, loading } = useApps();
    const router = useRouter();

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(query.toLowerCase()) ||
        app.description?.toLowerCase().includes(query.toLowerCase())
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && filteredApps.length > 0) {
            window.location.href = filteredApps[0].url;
        }
    };

    return (
        <div className="relative z-50">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search apps..."
                    className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
            </div>

            {/* Results Dropdown */}
            {isOpen && query.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-surface border border-white/10 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
                    ) : filteredApps.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">No apps found</div>
                    ) : (
                        <div className="py-1">
                            {filteredApps.map((app, index) => (
                                <a
                                    key={app.id}
                                    href={app.url}
                                    className={`block px-4 py-2 hover:bg-white/5 flex items-center gap-3 transition-colors ${index === 0 ? 'bg-white/5' : ''}`}
                                    onClick={() => usageTracker.trackAppOpen(app.id)}
                                >
                                    {/* App Icon would be nice here but we need generic icon mapper or just text */}
                                    <div className="w-8 h-8 rounded-lg bg-surface-highlight flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-white/5">
                                        {app.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium text-sm">{app.name}</div>
                                        <div className="text-gray-400 text-xs truncate">{app.description}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
