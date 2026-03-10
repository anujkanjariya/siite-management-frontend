import React, { useState, useEffect } from 'react';
import { Users, Plus, Check, X, Trash2, Edit2, IndianRupee, Loader2, AlertCircle } from 'lucide-react';
import * as api from '../../api/api';

const WorkerSection = ({ siteId }) => {
    const [workers, setWorkers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newWorkerName, setNewWorkerName] = useState('');
    const [selectedWorkerId, setSelectedWorkerId] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDescription, setPaymentDescription] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Payment State
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDate, setEditDate] = useState('');

    // Delete Confirmation State
    const [deletingPayment, setDeletingPayment] = useState(null); // { workerId, paymentId }

    const fetchWorkers = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.getWorkers(siteId);
            const mappedWorkers = (data || []).map(w => ({
                ...w,
                id: w._id,
                payments: (w.payments || []).map(p => ({ ...p, id: p._id }))
            }));
            setWorkers(mappedWorkers);
        } catch (err) {
            console.error('Failed to fetch workers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (siteId) {
            fetchWorkers();
        }
    }, [siteId]);

    const addWorker = async (e) => {
        e.preventDefault();
        if (newWorkerName.trim() && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await api.addWorker(siteId, { name: newWorkerName.trim() });
                setNewWorkerName('');
                setIsAdding(false);
                await fetchWorkers();
            } catch (err) {
                console.error('Failed to add worker:', err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const deleteWorker = async (id) => {
        if (window.confirm('Delete this worker and all records?')) {
            try {
                await api.deleteWorker(siteId, id);
                if (selectedWorkerId === id) setSelectedWorkerId(null);
                await fetchWorkers();
            } catch (err) {
                console.error('Failed to delete worker:', err);
            }
        }
    };

    const addPayment = async (e, workerId) => {
        e.preventDefault();
        if (paymentAmount && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await api.recordPayment(siteId, workerId, {
                    amount: parseFloat(paymentAmount),
                    date: paymentDate,
                    description: paymentDescription.trim()
                });
                setPaymentAmount('');
                setPaymentDescription('');
                await fetchWorkers();
            } catch (err) {
                console.error('Failed to add payment:', err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const startEditing = (payment) => {
        setEditingPaymentId(payment.id);
        setEditAmount(payment.amount.toString());
        setEditDescription(payment.description || '');
        setEditDate(new Date(payment.date).toISOString().split('T')[0]);
    };

    const cancelEditing = () => {
        setEditingPaymentId(null);
    };

    const handleUpdatePayment = async (workerId) => {
        if (!editAmount || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.updatePayment(siteId, workerId, editingPaymentId, {
                amount: parseFloat(editAmount),
                date: editDate,
                description: editDescription.trim()
            });
            setEditingPaymentId(null);
            await fetchWorkers();
        } catch (err) {
            console.error('Failed to update payment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeletePayment = async () => {
        if (!deletingPayment || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.deletePayment(siteId, deletingPayment.workerId, deletingPayment.paymentId);
            setDeletingPayment(null);
            await fetchWorkers();
        } catch (err) {
            console.error('Failed to delete payment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="mt-8 flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="mt-4 bg-white overflow-hidden">
            <div className="flex justify-between items-center mb-4 py-2 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users size={20} className="text-blue-600" />
                    Workers
                </h2>
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline"
                    >
                        <Plus size={16} />
                        Add Worker
                    </button>
                ) : (
                    <form onSubmit={addWorker} className="flex items-center gap-2 animate-in slide-in-from-right-2">
                        <input
                            type="text"
                            autoFocus
                            placeholder="Name"
                            value={newWorkerName}
                            onChange={(e) => setNewWorkerName(e.target.value)}
                            disabled={isSubmitting}
                            className="border-b border-blue-400 outline-none text-sm w-24 sm:w-32 py-1"
                        />
                        <button type="submit" disabled={isSubmitting} className="text-blue-600">
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} />}
                        </button>
                        <button onClick={() => setIsAdding(false)} disabled={isSubmitting} className="text-slate-400">
                            <X size={20} />
                        </button>
                    </form>
                )}
            </div>

            <div className="space-y-3">
                {workers.length === 0 ? (
                    <p className="text-slate-400 text-sm italic text-center py-4">No workers added.</p>
                ) : (
                    workers.map(worker => (
                        <div key={worker.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                            <div
                                onClick={() => setSelectedWorkerId(selectedWorkerId === worker.id ? null : worker.id)}
                                className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${selectedWorkerId === worker.id ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedWorkerId === worker.id ? 'bg-white/20' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {(worker.name || 'W').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-sm">{worker.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${selectedWorkerId === worker.id ? 'bg-white/20' : 'bg-slate-100 text-slate-800'
                                        }`}>
                                        ₹{(worker.payments || []).reduce((acc, curr) => acc + (curr.amount || 0), 0)}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteWorker(worker.id);
                                        }}
                                        className={`p-1 rounded-md transition-opacity ${selectedWorkerId === worker.id ? 'hover:bg-white/20 text-white' : 'text-red-500'
                                            }`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div
                                className={`grid transition-all duration-300 ease-in-out ${selectedWorkerId === worker.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                                        {/* Record Payment Form */}
                                        <form onSubmit={(e) => addPayment(e, worker.id)} className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="col-span-1">
                                                <label className="text-[10px] font-bold text-slate-800 uppercase mb-1 block">Date</label>
                                                <input
                                                    type="date"
                                                    value={paymentDate}
                                                    onChange={(e) => setPaymentDate(e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="text-[10px] font-bold text-slate-800 uppercase mb-1 block">Amount</label>
                                                <input
                                                    type="number"
                                                    placeholder="₹"
                                                    value={paymentAmount}
                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 font-bold"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] font-bold text-slate-800 uppercase mb-1 block">Description</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Advance, Final Payment"
                                                    value={paymentDescription}
                                                    onChange={(e) => setPaymentDescription(e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-slate-800 text-white rounded-lg px-8 py-2 text-xs font-bold hover:bg-slate-900 transition-colors mt-1 shadow-sm flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                                    Payment
                                                </button>
                                            </div>
                                        </form>

                                        {/* Payment History */}
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">History</h4>
                                            {worker.payments.length === 0 ? (
                                                <p className="text-[10px] text-slate-400 italic">No payments recorded.</p>
                                            ) : (
                                                [...worker.payments].reverse().map(payment => (
                                                    <div key={payment.id} className="py-2 border-b border-slate-100 last:border-0 group">
                                                        {editingPaymentId === payment.id ? (
                                                            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95 duration-200">
                                                                <div className="grid grid-cols-2 gap-2 mb-3">
                                                                    <div>
                                                                        <label className="text-[9px] font-black text-blue-600 uppercase mb-1 block">Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={editDate}
                                                                            onChange={(e) => setEditDate(e.target.value)}
                                                                            className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-black text-blue-600 uppercase mb-1 block">Amount</label>
                                                                        <input
                                                                            type="number"
                                                                            value={editAmount}
                                                                            onChange={(e) => setEditAmount(e.target.value)}
                                                                            className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500 font-bold"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <label className="text-[9px] font-black text-blue-600 uppercase mb-1 block">Description</label>
                                                                        <input
                                                                            type="text"
                                                                            value={editDescription}
                                                                            onChange={(e) => setEditDescription(e.target.value)}
                                                                            className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={cancelEditing}
                                                                        className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdatePayment(worker.id)}
                                                                        disabled={isSubmitting}
                                                                        className="bg-blue-600 text-white px-3 py-1 text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1 shadow-md shadow-blue-100"
                                                                    >
                                                                        {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-between items-center group/item">
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <span className="text-[12px] text-slate-800 font-medium w-16 shrink-0">
                                                                        {new Date(payment.date).toLocaleDateString()}
                                                                    </span>
                                                                    <div className="flex flex-col flex-1">
                                                                        <div className="flex items-center gap-1">
                                                                            <IndianRupee size={10} className="text-slate-800" />
                                                                            <span className="text-xs font-bold text-slate-700">{payment.amount}</span>
                                                                        </div>
                                                                        {payment.description && (
                                                                            <span className="text-sm text-slate-600 mt-0.5">{payment.description}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => startEditing(payment)}
                                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeletingPayment({ workerId: worker.id, paymentId: payment.id })}
                                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))
                )}
            </div>

            {/* Delete Payment Confirmation Modal */}
            {deletingPayment && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <Trash2 size={32} />
                        </div>

                        <h3 className="text-xl font-black text-slate-900 text-center mb-2">Delete Payment?</h3>
                        <p className="text-slate-500 text-center font-medium mb-8">
                            Are you sure you want to delete this payment record? This action cannot be undone.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDeletePayment}
                                disabled={isSubmitting}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-red-100 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setDeletingPayment(null)}
                                disabled={isSubmitting}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerSection;
