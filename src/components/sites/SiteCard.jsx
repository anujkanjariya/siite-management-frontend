import React, { useState } from 'react';
import { Trash2, ChevronRight, Building2, AlertTriangle, Check, X, Edit2 } from 'lucide-react';

const SiteCard = ({ site, onSelect, onDelete, onRename }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedName, setEditedName] = useState(site.name);

    const handleRename = async (e) => {
        if (e) e.stopPropagation();
        if (editedName.trim() && editedName !== site.name) {
            await onRename(site.id, editedName.trim());
        }
        setShowEditModal(false);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const confirmDelete = (e) => {
        e.stopPropagation();
        onDelete(site.id);
        setShowDeleteModal(false);
    };

    return (
        <>
            <div
                onClick={() => onSelect(site.id)}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
            >
                <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex-shrink-0 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <Building2 size={20} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {site.name}
                            </h3>
                            <p className="text-slate-500 text-[10px] sm:text-xs">
                                Site Project
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditedName(site.name);
                                setShowEditModal(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-500 transition-all"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-slate-400 hover:text-red-500 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* <div className="px-5 py-3 bg-slate-50 border-t border-slate-50 flex items-center justify-between group-hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-slate-600 text-xs sm:text-sm font-bold tracking-tight">
                            {site.items?.length || 0} Records Found
                        </span>
                    </div>
                    <span className="text-blue-600 font-bold text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open
                        <ChevronRight size={14} />
                    </span>
                </div> */}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Edit2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Rename Project</h3>
                        </div>

                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Project Name</label>
                            <input
                                autoFocus
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename(e)}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-semibold text-slate-800"
                                placeholder="Enter project name..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRename}
                                className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(false);
                    }}
                >
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                                <AlertTriangle size={32} />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Project?</h3>
                        <p className="text-slate-500 text-center text-sm mb-8">
                            Are you sure you want to delete <span className="font-bold text-slate-700">"{site.name}"</span>? This action cannot be undone.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteModal(false);
                                }}
                                className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SiteCard;
