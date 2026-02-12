"use client";

import { useState, useEffect } from "react";
import { AppsConfig, Category, App } from "@/types/apps";
import { Plus, Save, X, Edit2, Trash2, Loader2, GripVertical } from "lucide-react";
import { CategoryEditor } from "./CategoryEditor";
import { AppEditor } from "./AppEditor";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    useDroppable,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable App Component with category context
function SortableApp({
    app,
    categoryId,
    onEdit,
    onDelete,
}: {
    app: App;
    categoryId: string | null;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const uniqueId = categoryId ? `${categoryId}:${app.id}` : `uncategorized:${app.id}`;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: uniqueId,
        data: {
            type: 'app',
            app,
            categoryId,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
        >
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded"
                >
                    <GripVertical className="w-4 h-4 text-gray-500" />
                </button>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{app.name}</h4>
                    <p className="text-xs text-gray-400 truncate">{app.description}</p>
                </div>
            </div>
            <div className="flex gap-1 ml-2">
                <button
                    onClick={onEdit}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="Edit App"
                >
                    <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete App"
                >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
            </div>
        </div>
    );
}

// Droppable Category Container
function DroppableCategory({
    category,
    apps,
    onEdit,
    onDelete,
    onAddApp,
    onEditApp,
    onDeleteApp,
    isOver,
}: {
    category: Category;
    apps: App[];
    onEdit: () => void;
    onDelete: () => void;
    onAddApp: () => void;
    onEditApp: (app: App) => void;
    onDeleteApp: (appId: string) => void;
    isOver: boolean;
}) {
    const { attributes, listeners, setNodeRef: setCategoryRef, transform, transition, isDragging } = useSortable({
        id: `category:${category.id}`,
        data: {
            type: 'category',
            category,
        },
    });

    const { setNodeRef: setDroppableRef } = useDroppable({
        id: category.id,
        data: {
            type: 'category-drop-zone',
            categoryId: category.id,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setCategoryRef}
            style={style}
            className={`bg-white/5 rounded-lg p-6 space-y-4 transition-all duration-200 ${isOver
                ? 'ring-2 ring-primary/70 bg-primary/10 shadow-lg shadow-primary/20'
                : ''
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded"
                    >
                        <GripVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        {category.description && (
                            <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onAddApp}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Add App"
                    >
                        <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit Category"
                    >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Category"
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                </div>
            </div>

            {/* Apps in Category - Enhanced Droppable Zone */}
            <div
                ref={setDroppableRef}
                className={`pl-8 min-h-[120px] rounded-lg p-4 transition-all duration-200 ${isOver
                    ? 'border-2 border-dashed border-primary bg-primary/5'
                    : 'border-2 border-transparent'
                    }`}
            >
                {isOver && (
                    <div className="text-center py-4 mb-4">
                        <p className="text-primary font-medium">Drop app here to add to {category.name}</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {apps.map((app) => (
                        <SortableApp
                            key={app.id}
                            app={app}
                            categoryId={category.id}
                            onEdit={() => onEditApp(app)}
                            onDelete={() => onDeleteApp(app.id)}
                        />
                    ))}
                </div>
                {apps.length === 0 && !isOver && (
                    <p className="text-sm text-gray-500 italic">No apps in this category. Drag apps here to add them.</p>
                )}
            </div>
        </div>
    );
}

export function AppsManager() {
    const [config, setConfig] = useState<AppsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingApp, setEditingApp] = useState<{ categoryId: string | null; app: App | null } | null>(null);
    const [showCategoryEditor, setShowCategoryEditor] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/apps');
            if (!response.ok) throw new Error('Failed to load config');
            const data = await response.json();
            setConfig(data);
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        if (!config) return;

        try {
            setSaving(true);
            const response = await fetch('/api/apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (!response.ok) throw new Error('Failed to save config');

            // Refresh to get resolved URLs
            await fetchConfig();
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event: DragOverEvent) => {
        setOverId(event.over?.id?.toString() || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setOverId(null);

        if (!over || !config) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        // Handle category reordering
        if (activeData?.type === 'category' && overData?.type === 'category') {
            const oldIndex = config.categories.findIndex((c) => `category:${c.id}` === active.id);
            const newIndex = config.categories.findIndex((c) => `category:${c.id}` === over.id);

            if (oldIndex !== newIndex) {
                setConfig({
                    ...config,
                    categories: arrayMove(config.categories, oldIndex, newIndex),
                });
            }
            return;
        }

        // Handle app dragging
        if (activeData?.type === 'app') {
            const sourceCategory = activeData.categoryId;
            const app = activeData.app;

            // Determine destination category
            let destinationCategory: string | null = null;

            if (overData?.type === 'category-drop-zone') {
                destinationCategory = overData.categoryId;
            } else if (overData?.type === 'app') {
                destinationCategory = overData.categoryId;
            } else if (over.id === 'uncategorized') {
                destinationCategory = null;
            }

            // Move app between categories
            if (sourceCategory !== destinationCategory) {
                moveAppBetweenCategories(sourceCategory, destinationCategory, app);
            } else if (sourceCategory === null && destinationCategory === null) {
                // Reorder within uncategorized
                const uncategorizedApps = config.uncategorizedApps || [];
                const oldIndex = uncategorizedApps.findIndex((a) => a.id === app.id);
                const newIndex = uncategorizedApps.findIndex((a) => `uncategorized:${a.id}` === over.id);

                if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                    setConfig({
                        ...config,
                        uncategorizedApps: arrayMove(uncategorizedApps, oldIndex, newIndex),
                    });
                }
            } else if (sourceCategory === destinationCategory) {
                // Reorder within same category
                const categoryIndex = config.categories.findIndex((c) => c.id === sourceCategory);
                if (categoryIndex !== -1) {
                    const category = config.categories[categoryIndex];
                    const oldIndex = category.apps.findIndex((a) => a.id === app.id);
                    const newIndex = category.apps.findIndex((a) => `${sourceCategory}:${a.id}` === over.id);

                    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                        const newCategories = [...config.categories];
                        newCategories[categoryIndex] = {
                            ...category,
                            apps: arrayMove(category.apps, oldIndex, newIndex),
                        };
                        setConfig({
                            ...config,
                            categories: newCategories,
                        });
                    }
                }
            }
        }
    };

    const moveAppBetweenCategories = (sourceCategoryId: string | null, destinationCategoryId: string | null, app: App) => {
        if (!config) return;

        let newConfig = { ...config };

        // Remove from source
        if (sourceCategoryId === null) {
            newConfig.uncategorizedApps = (config.uncategorizedApps || []).filter((a) => a.id !== app.id);
        } else {
            newConfig.categories = config.categories.map((category) => {
                if (category.id === sourceCategoryId) {
                    return {
                        ...category,
                        apps: category.apps.filter((a) => a.id !== app.id),
                    };
                }
                return category;
            });
        }

        // Add to destination
        if (destinationCategoryId === null) {
            newConfig.uncategorizedApps = [...(newConfig.uncategorizedApps || []), app];
        } else {
            newConfig.categories = newConfig.categories.map((category) => {
                if (category.id === destinationCategoryId) {
                    return {
                        ...category,
                        apps: [...category.apps, app],
                    };
                }
                return category;
            });
        }

        setConfig(newConfig);
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setShowCategoryEditor(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setShowCategoryEditor(true);
    };

    const handleSaveCategory = (category: Category) => {
        if (!config) return;

        if (editingCategory) {
            // Update existing
            setConfig({
                ...config,
                categories: config.categories.map(c =>
                    c.id === editingCategory.id ? category : c
                ),
            });
        } else {
            // Add new
            setConfig({
                ...config,
                categories: [...config.categories, category],
            });
        }

        setShowCategoryEditor(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = (categoryId: string) => {
        if (!config) return;
        if (!confirm('Are you sure you want to delete this category and all its apps?')) return;

        setConfig({
            ...config,
            categories: config.categories.filter(c => c.id !== categoryId),
        });
    };

    const handleAddApp = (categoryId: string | null) => {
        setEditingApp({ categoryId, app: null });
    };

    const handleEditApp = (categoryId: string | null, app: App) => {
        setEditingApp({ categoryId, app });
    };

    const handleSaveApp = (categoryId: string | null, app: App) => {
        if (!config) return;

        if (categoryId === null) {
            // Uncategorized app
            const uncategorizedApps = config.uncategorizedApps || [];
            if (editingApp?.app) {
                // Update existing
                setConfig({
                    ...config,
                    uncategorizedApps: uncategorizedApps.map(a => a.id === editingApp.app!.id ? app : a),
                });
            } else {
                // Add new
                setConfig({
                    ...config,
                    uncategorizedApps: [...uncategorizedApps, app],
                });
            }
        } else {
            // Categorized app
            setConfig({
                ...config,
                categories: config.categories.map(category => {
                    if (category.id !== categoryId) return category;

                    if (editingApp?.app) {
                        // Update existing
                        return {
                            ...category,
                            apps: category.apps.map(a => a.id === editingApp.app!.id ? app : a),
                        };
                    } else {
                        // Add new
                        return {
                            ...category,
                            apps: [...category.apps, app],
                        };
                    }
                }),
            });
        }

        setEditingApp(null);
    };

    const handleDeleteApp = (categoryId: string | null, appId: string) => {
        if (!config) return;
        if (!confirm('Are you sure you want to delete this app?')) return;

        if (categoryId === null) {
            // Delete from uncategorized
            setConfig({
                ...config,
                uncategorizedApps: (config.uncategorizedApps || []).filter(a => a.id !== appId),
            });
        } else {
            // Delete from category
            setConfig({
                ...config,
                categories: config.categories.map(category => {
                    if (category.id !== categoryId) return category;
                    return {
                        ...category,
                        apps: category.apps.filter(a => a.id !== appId),
                    };
                }),
            });
        }
    };

    const { setNodeRef: setUncategorizedRef } = useDroppable({
        id: 'uncategorized',
        data: {
            type: 'category-drop-zone',
            categoryId: null,
        },
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!config) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400">Failed to load configuration</p>
            </div>
        );
    }

    // Get all sortable IDs for the global context
    const allAppIds = [
        ...(config.uncategorizedApps || []).map(a => `uncategorized:${a.id}`),
        ...config.categories.flatMap(c => c.apps.map(a => `${c.id}:${a.id}`)),
    ];

    const allCategoryIds = config.categories.map(c => `category:${c.id}`);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Apps Management</h2>
                        <p className="text-sm text-gray-400 mt-1">Manage your apps and categories. Drag apps between categories to organize them.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={handleAddCategory}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Category
                        </button>
                        <button
                            onClick={saveConfig}
                            disabled={saving}
                            className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Category Editor Modal */}
                {showCategoryEditor && (
                    <CategoryEditor
                        category={editingCategory}
                        onSave={handleSaveCategory}
                        onCancel={() => {
                            setShowCategoryEditor(false);
                            setEditingCategory(null);
                        }}
                    />
                )}

                {/* Display Settings */}
                {/* Display Settings - Tile Size */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Tile Size</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Choose the display size for your app tiles.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg">
                        <button
                            onClick={() => setConfig(config ? { ...config, tileSize: 'small' } : null)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${config?.tileSize === 'small'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Compact
                        </button>

                        <button
                            onClick={() => setConfig(config ? { ...config, tileSize: 'medium' } : null)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${config?.tileSize === 'medium' || !config?.tileSize
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Standard
                        </button>

                        <button
                            onClick={() => setConfig(config ? { ...config, tileSize: 'large' } : null)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${config?.tileSize === 'large'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Comfort
                        </button>
                    </div>
                </div>

                {/* App Editor Modal */}
                {editingApp && (
                    <AppEditor
                        app={editingApp.app}
                        onSave={(app) => handleSaveApp(editingApp.categoryId, app)}
                        onCancel={() => setEditingApp(null)}
                    />
                )}

                <SortableContext items={[...allAppIds, ...allCategoryIds]} strategy={verticalListSortingStrategy}>
                    <div className="space-y-6">
                        {/* Favorites Section - Read-only Display */}
                        {(() => {
                            // Collect all favorite apps from all categories and uncategorized
                            const favoriteApps = [
                                ...(config.uncategorizedApps || []).filter(app => app.isFavorite),
                                ...config.categories.flatMap(cat => cat.apps.filter(app => app.isFavorite))
                            ];

                            if (favoriteApps.length === 0) return null;

                            return (
                                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-6 space-y-4 border border-yellow-500/20">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <span className="text-2xl">⭐</span>
                                                Favorites
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">Your most frequently used apps</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {favoriteApps.map((app) => {
                                            // Find which category this app belongs to
                                            const categoryId = config.categories.find(cat =>
                                                cat.apps.some(a => a.id === app.id)
                                            )?.id || null;

                                            return (
                                                <div
                                                    key={app.id}
                                                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-1">
                                                            <h4 className="text-white font-medium">{app.name}</h4>
                                                            <p className="text-sm text-gray-400 mt-1">{app.description}</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleEditApp(categoryId, app)}
                                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                                title="Edit App"
                                                            >
                                                                <Edit2 className="w-4 h-4 text-gray-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-gray-500 italic">
                                        Tip: Edit an app and toggle "Mark as Favorite" to add or remove from this section
                                    </p>
                                </div>
                            );
                        })()}

                        {/* Uncategorized Apps Section - Enhanced Droppable */}
                        <div
                            ref={setUncategorizedRef}
                            className={`bg-white/5 rounded-lg p-6 space-y-4 transition-all duration-200 ${overId === 'uncategorized'
                                ? 'ring-2 ring-primary/70 bg-primary/10 shadow-lg shadow-primary/20'
                                : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Quick Access (Uncategorized)</h3>
                                    <p className="text-sm text-gray-400 mt-1">Apps without a category. Drag apps here to uncategorize them.</p>
                                </div>
                                <button
                                    onClick={() => handleAddApp(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Add Uncategorized App"
                                >
                                    <Plus className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>

                            <div
                                className={`min-h-[120px] rounded-lg p-4 transition-all duration-200 ${overId === 'uncategorized'
                                    ? 'border-2 border-dashed border-primary bg-primary/5'
                                    : 'border-2 border-transparent'
                                    }`}
                            >
                                {overId === 'uncategorized' && (
                                    <div className="text-center py-4 mb-4">
                                        <p className="text-primary font-medium">Drop app here to move to Quick Access</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(config.uncategorizedApps || []).map((app) => (
                                        <SortableApp
                                            key={app.id}
                                            app={app}
                                            categoryId={null}
                                            onEdit={() => handleEditApp(null, app)}
                                            onDelete={() => handleDeleteApp(null, app.id)}
                                        />
                                    ))}
                                </div>
                                {(!config.uncategorizedApps || config.uncategorizedApps.length === 0) && overId !== 'uncategorized' && (
                                    <p className="text-sm text-gray-500 italic">No uncategorized apps. Drag apps here to uncategorize them.</p>
                                )}
                            </div>
                        </div>

                        {/* Categories - Sortable and Droppable */}
                        {config.categories.map((category) => (
                            <DroppableCategory
                                key={category.id}
                                category={category}
                                apps={category.apps}
                                onEdit={() => handleEditCategory(category)}
                                onDelete={() => handleDeleteCategory(category.id)}
                                onAddApp={() => handleAddApp(category.id)}
                                onEditApp={(app) => handleEditApp(category.id, app)}
                                onDeleteApp={(appId) => handleDeleteApp(category.id, appId)}
                                isOver={overId === category.id}
                            />
                        ))}

                        {config.categories.length === 0 && (
                            <div className="text-center py-12 bg-white/5 rounded-lg">
                                <p className="text-gray-400">No categories yet. Add one to get started!</p>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>
        </DndContext >
    );
}
