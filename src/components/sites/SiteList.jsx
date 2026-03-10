import React, { useState } from 'react';
import { Plus, Check, X, Building2 } from 'lucide-react';
import SiteCard from './SiteCard';

const SiteList = ({ sites, onAddSite, onSelectSite, onDeleteSite, onRenameSite }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newSiteName, setNewSiteName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newSiteName.trim()) {
            onAddSite(newSiteName.trim());
            setNewSiteName('');
            setIsAdding(false);
        }
    };

    return (
        <div className="py-4 sm:py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-10 gap-4 sm:gap-6">
                <div className="w-full md:w-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Jagdishbhai's Sites</h2>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">Select a site to manage its billing or add a new one.</p>
                </div>

                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full md:w-auto group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 font-semibold text-sm sm:text-base"
                    >
                        <Plus className="group-hover:rotate-90 transition-transform duration-300" size={18} />
                        Create New Site
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-row items-center gap-2 w-full md:w-auto animate-in fade-in slide-in-from-right-4 duration-300">
                        <input
                            type="text"
                            autoFocus
                            placeholder="Project Name"
                            value={newSiteName}
                            onChange={(e) => setNewSiteName(e.target.value)}
                            className="px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 outline-none flex-grow md:w-64 transition-all text-sm sm:text-base"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <Check size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="bg-slate-100 text-slate-500 p-3 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </form>
                )}
            </div>

            {sites.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-16 text-center animate-pulse">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Building2 size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No Sites Found</h3>
                    <p className="text-slate-500 mb-6 sm:mb-8 max-w-xs sm:max-w-sm mx-auto text-sm sm:text-base">Start by creating your first site to track billing and dimensions.</p>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        + Add Your First Site
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {[...sites]
                        .sort((a, b) => b.id.localeCompare(a.id))
                        .map(site => (
                            <SiteCard
                                key={site.id}
                                site={site}
                                onSelect={onSelectSite}
                                onDelete={onDeleteSite}
                                onRename={onRenameSite}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export default SiteList;
