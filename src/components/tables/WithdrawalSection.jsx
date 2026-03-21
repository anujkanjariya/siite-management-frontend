import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2, Calendar, IndianRupee } from 'lucide-react';
import * as api from '../../api/api';

const WithdrawalSection = ({ siteId, onWithdrawalsChange }) => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDate, setEditDate] = useState('');

    const fetchWithdrawals = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.getWithdrawals(siteId);
            setWithdrawals(data || []);
            if (onWithdrawalsChange) {
                const total = (data || []).reduce((sum, w) => sum + (w.amount || 0), 0);
                onWithdrawalsChange(total);
            }
        } catch (err) {
            console.error('Failed to fetch withdrawals:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (siteId) {
            fetchWithdrawals();
        }
    }, [siteId]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!amount || isLoading) return;
        try {
            await api.addWithdrawal(siteId, { amount: parseFloat(amount), date });
            setAmount('');
            setIsAdding(false);
            fetchWithdrawals();
        } catch (err) {
            console.error('Failed to add withdrawal:', err);
        }
    };

    const handleUpdate = async (id) => {
        if (!editAmount || isLoading) return;
        try {
            await api.updateWithdrawal(siteId, id, { amount: parseFloat(editAmount), date: editDate });
            setEditingId(null);
            fetchWithdrawals();
        } catch (err) {
            console.error('Failed to update withdrawal:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this withdrawal?')) return;
        try {
            await api.deleteWithdrawal(siteId, id);
            fetchWithdrawals();
        } catch (err) {
            console.error('Failed to delete withdrawal:', err);
        }
    };

    if (isLoading && withdrawals.length === 0) {
        return (
            <div className="mt-8 flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <IndianRupee size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Withdrawals</h3>
                </div>
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                        <Plus size={14} />
                        Add Entry
                    </button>
                ) : (
                    <button
                        onClick={() => setIsAdding(false)}
                        className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-all"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {isAdding && (
                <form
                    onSubmit={handleAdd}
                    className="p-5 bg-blue-50/30 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-5 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300"
                >
                    <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block ml-1">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="₹ 0.00"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all font-bold placeholder:font-normal"
                            required
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block ml-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="sm:col-span-1 bg-blue-600 text-white h-[42px] rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-[0.98]"
                    >
                        Add
                    </button>
                </form>
            )}

            <div className="divide-y divide-slate-100">
                {withdrawals.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                            <IndianRupee size={24} />
                        </div>
                        <p className="text-slate-400 text-xs italic">No withdrawals recorded for this project.</p>
                    </div>
                ) : (
                    [...withdrawals].reverse().map((w) => (
                        <div key={w._id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                            {editingId === w._id ? (
                                <div className="flex flex-col sm:flex-row flex-1 gap-3 sm:items-end animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex-1">
                                        <label className="text-[9px] font-black text-blue-600 uppercase mb-1 block">Amount</label>
                                        <input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            className="w-full bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[9px] font-black text-blue-600 uppercase mb-1 block">Date</label>
                                        <input
                                            type="date"
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                            className="w-full bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate(w._id)}
                                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="bg-slate-100 text-slate-500 p-2 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                                <IndianRupee size={12} className="text-slate-800" />
                                                <span className="text-base font-bold text-slate-800 font-mono tracking-tight">{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 py-0.5 px-2 bg-slate-100 rounded-full">
                                                    <Calendar size={10} />
                                                    {new Date(w.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <button
                                            onClick={() => {
                                                setEditingId(w._id);
                                                setEditAmount(w.amount);
                                                setEditDate(new Date(w.date).toISOString().split('T')[0]);
                                            }}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(w._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WithdrawalSection;
