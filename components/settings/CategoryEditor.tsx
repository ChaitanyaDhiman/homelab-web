"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types/apps";
import { X } from "lucide-react";

interface CategoryEditorProps {
    category: Category | null;
    onSave: (category: Category) => void;
    onCancel: () => void;
}

export function CategoryEditor({ category, onSave, onCancel }: CategoryEditorProps) {
    const [id, setId] = useState(category?.id || "");
    const [name, setName] = useState(category?.name || "");
    const [description, setDescription] = useState(category?.description || "");

    useEffect(() => {
        if (category) {
            setId(category.id);
            setName(category.name);
            setDescription(category.description || "");
        }
    }, [category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!id || !name) {
            alert("Please fill in all required fields");
            return;
        }

        onSave({
            id,
            name,
            description,
            apps: category?.apps || [],
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                        {category ? "Edit Category" : "Add Category"}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            ID <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            disabled={!!category}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary disabled:opacity-50"
                            placeholder="e.g., media, storage"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Lowercase, no spaces (auto-formatted)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                            placeholder="e.g., Media, Storage"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                            placeholder="Brief description of this category"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                            {category ? "Update" : "Add"} Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
