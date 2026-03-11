import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Check, Loader2, Edit2, Download } from 'lucide-react';
import WorkerSection from '../workers/WorkerSection';
import * as api from '../../api/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const BillingTable = ({
    siteId,
    siteName,
    onBack,
    onRenameSite,
    onRefreshSites
}) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.getBillingItems(siteId);
            setItems((data || []).map(item => ({ ...item, id: item._id })));
        } catch (err) {
            console.error('Failed to fetch billing items:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (siteId) {
            fetchItems();
        }
    }, [siteId]);

    const addItem = async () => {
        try {
            const { data } = await api.addBillingItem(siteId, {
                name: '',
                length: 0,
                width: 0,
                rate: 0
            });
            setItems([...items, { ...data, id: data._id }]);
            if (onRefreshSites) onRefreshSites();
        } catch (err) {
            console.error('Failed to add item:', err);
        }
    };

    const removeItem = async (itemId) => {
        if (!itemId) return;
        try {
            await api.deleteBillingItem(siteId, itemId);
            setItems(items.filter(item => item.id !== itemId));
            if (onRefreshSites) onRefreshSites();
        } catch (err) {
            console.error('Failed to delete item:', err);
        }
    };

    const handleInputChange = async (index, field, value) => {
        const updatedItems = [...items];
        let newValue = value;

        if (field !== 'name') {
            newValue = value === '' ? 0 : Math.max(0, parseFloat(value));
        }

        updatedItems[index][field] = newValue;

        // Auto-fill width/length if one is set to 0 and other is changed
        if (field === 'length' && (updatedItems[index].width === 0)) {
            updatedItems[index].width = 1;
        }
        if (field === 'width' && (updatedItems[index].length === 0)) {
            updatedItems[index].length = 1;
        }

        setItems(updatedItems);
    };

    const handleBlur = async (index) => {
        const item = items[index];
        if (!item.id) return;
        try {
            await api.updateBillingItem(siteId, item.id, {
                name: item.name,
                length: item.length,
                width: item.width,
                rate: item.rate
            });
        } catch (err) {
            console.error('Failed to update item:', err);
        }
    };


    const calculateTotalFoot = (length, width) => {
        const l = parseFloat(length) || 0;
        const w = parseFloat(width) || 0;
        return (l * w).toFixed(2);
    };

    const calculateTotalAmount = (length, width, rate) => {
        const l = parseFloat(length) || 0;
        const w = parseFloat(width) || 0;
        const r = parseFloat(rate) || 0;
        return (l * w * r).toFixed(2);
    };

    const grandTotal = items.reduce((sum, item) => {
        const l = parseFloat(item.length) || 0;
        const w = parseFloat(item.width) || 0;
        const r = parseFloat(item.rate) || 0;
        return sum + (l * w * r);
    }, 0).toFixed(2);

    const downloadPDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Header Section ---
        doc.setFillColor(37, 99, 235); // Blue primary color
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Tiles Fiting', 20, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Premium Installation Services', 20, 32);

        // Right side of header (Static Meta)
        doc.setFontSize(10);
        doc.text('Name: Jagdishbhai Kanjariya', pageWidth - 20, 18, { align: 'right' });
        doc.text('Contact: 9924030570', pageWidth - 20, 24, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 30, { align: 'right' });

        // --- Dynamic Info ---
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice Details', 20, 55);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Site Name: ${siteName || 'N/A'}`, 20, 62);

        // --- Table Section ---
        const tableData = items.map((item, index) => [
            index + 1,
            item.name || '-',
            item.length || '0',
            item.width || '0',
            calculateTotalFoot(item.length, item.width),
            `Rs. ${item.rate || '0'}`,
            `Rs. ${calculateTotalAmount(item.length, item.width, item.rate)}`
        ]);

        autoTable(doc, {
            startY: 70,
            head: [['#', 'Item', 'L', 'W', 'Total Foot', 'Rate', 'Total Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [51, 65, 85], // Slate-700
                textColor: [255, 255, 255],
                fontSize: 10,
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                2: { halign: 'center', cellWidth: 15 },
                3: { halign: 'center', cellWidth: 15 },
                4: { halign: 'center', cellWidth: 25 },
                5: { halign: 'center', cellWidth: 25 },
                6: { halign: 'right', cellWidth: 35 }
            },
            styles: {
                fontSize: 9,
                cellPadding: 4
            }
        });

        // --- Total Section ---
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFillColor(248, 250, 252); // Slate-50
        doc.rect(pageWidth - 100, finalY - 8, 80, 12, 'F');

        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total:', pageWidth - 95, finalY);

        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235); // Blue-600
        doc.text(`Rs. ${grandTotal}`, pageWidth - 25, finalY, { align: 'right' });

        // Footer Line
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.line(20, finalY + 10, pageWidth - 20, finalY + 10);

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text('Thank you for your business!', pageWidth / 2, finalY + 20, { align: 'center' });

        const fileName = `${siteName || 'Billing'}_Invoice.pdf`;

        if (Capacitor.isNativePlatform()) {
            try {
                // Generate PDF as base64
                const pdfBase64 = doc.output('datauristring').split(',')[1];

                // Save file to cache directory so it can be shared
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: pdfBase64,
                    directory: Directory.Cache
                });

                // Open the native share dialog
                await Share.share({
                    title: 'Share PDF',
                    text: `Invoice for ${siteName || 'Project'}`,
                    url: savedFile.uri,
                });
            } catch (error) {
                console.error('Error sharing PDF:', error);
                alert('Could not share PDF. Please try again.');
            }
        } else {
            doc.save(fileName);
        }
    };


    const [showEditModal, setShowEditModal] = useState(false);
    const [currentSiteName, setCurrentSiteName] = useState(siteName);

    useEffect(() => {
        setCurrentSiteName(siteName);
    }, [siteName]);

    const handleRenameSite = async () => {
        if (currentSiteName.trim() && currentSiteName !== siteName) {
            try {
                await api.updateSite(siteId, { name: currentSiteName.trim() });
                if (onRenameSite) {
                    onRenameSite(siteId, currentSiteName.trim());
                }
                setShowEditModal(false);
            } catch (err) {
                console.error('Failed to rename site:', err);
            }
        } else {
            setShowEditModal(false);
        }
    };

    return (
        <div className=" bg-white max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                        title="Back to Sites"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="group relative">
                        <h2
                            onClick={() => setShowEditModal(true)}
                            className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                            {currentSiteName || 'Billing Table'}
                            <Edit2 size={16} className="text-slate-300 group-hover:text-blue-400" />
                        </h2>
                        <p className="text-sm text-slate-500">Manage items and dimensions for this project.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                    <button
                        onClick={downloadPDF}
                        className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all duration-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                        <Download size={18} className="sm:w-[20px] sm:h-[20px]" />
                        Download
                    </button>

                    <button
                        onClick={addItem}
                        className="flex-1 md:flex-none border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all duration-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                        <Plus size={18} className="sm:w-[20px] sm:h-[20px]" />
                        Add Row
                    </button>

                </div>
            </div>


            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-400 shadow-sm">
                    <table className="w-full text-left border-collapse bg-white">
                        <thead className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs font-semibold">
                            <tr>
                                <th className="px-1 sm:px-4 py-3 sm:py-4 border-b border-r border-gray-400 text-center w-6 sm:w-12">#</th>
                                <th className="px-1 sm:px-4 py-3 sm:py-4 border-b border-r border-gray-400">Item</th>
                                <th className="px-1 sm:px-4 py-3 sm:py-4 border-b border-r border-gray-400 text-center">L</th>
                                <th className="px-1 sm:px-4 py-3 sm:py-4 border-b border-r border-gray-400 text-center">W</th>
                                <th className="px-1 sm:px-4 py-3 sm:py-4 border-b border-r border-gray-400 text-center">Total Foot</th>
                                <th className="px-1 sm:px-4 py-3 sm:py-4 border-b border-r border-gray-400 text-center">Rate</th>
                                <th className="px-1 sm:px-4 py-3 sm:py-4 border-b border-r border-gray-400 text-center">Total</th>
                                <th className="px-1 sm:px-4 py-3 sm:py-4 border-b border-gray-400 text-center sm:w-16">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400">
                            {items.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-gray-50/50 transition duration-150 text-[13px]">
                                    <td className="px-1 sm:px-4 py-2 sm:py-4 border-r border-gray-400 text-gray-500 font-medium text-center">{index + 1}</td>
                                    <td className="px-1 sm:px-4 py-2 sm:py-4 border-r border-gray-400 min-w-[80px]">
                                        <input
                                            type="text"
                                            placeholder="Item Name"
                                            value={item.name}
                                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className="w-full bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 focus:ring-0 outline-none transition duration-200 py-0.5"
                                        />
                                    </td>
                                    <td className="px-1 sm:px-4 py-2 sm:py-4 border-r border-gray-400 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.length === 0 ? '' : item.length}
                                            onChange={(e) => handleInputChange(index, 'length', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className="w-8 sm:w-16 text-center bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 focus:ring-0 outline-none transition duration-200"
                                        />
                                    </td>
                                    <td className="px-1 sm:px-4 py-2 sm:py-4 border-r border-gray-400 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.width === 0 ? '' : item.width}
                                            onChange={(e) => handleInputChange(index, 'width', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className="w-8 sm:w-16 text-center bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 focus:ring-0 outline-none transition duration-200"
                                        />
                                    </td>
                                    <td className="px-1 sm:px-4 py-2 sm:py-4 border-r border-gray-400 text-center font-mono text-gray-700 bg-gray-50/10 font-medium">
                                        {calculateTotalFoot(item.length, item.width)}
                                    </td>
                                    <td className="px-1 sm:px-4 py-2 sm:py-4 border-r border-gray-400 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.rate === 0 ? '' : item.rate}
                                            onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className="w-10 sm:w-20 text-center bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 focus:ring-0 outline-none transition duration-200"
                                        />
                                    </td>
                                    <td className="px-1 sm:px-4 py-2 sm:py-4 border-r border-gray-400 text-right font-bold text-gray-800">
                                        ₹{calculateTotalAmount(item.length, item.width, item.rate)}
                                    </td>
                                    <td className="px-1 sm:px-4 py-2 sm:py-4 text-center">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-400 hover:text-red-600 p-1 sm:p-2 rounded-lg hover:bg-red-50 transition duration-200"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            {/* Edit Modal */}
            {showEditModal && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
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
                                value={currentSiteName}
                                onChange={(e) => setCurrentSiteName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRenameSite()}
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
                                onClick={handleRenameSite}
                                className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Total Footer */}
            <div className="mt-3 flex justify-end">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg sm:rounded-3xl flex items-center gap-4 sm:gap-8 shadow-2xl shadow-blue-200 border border-blue-500">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] sm:text-xs font-bold text-blue-100 uppercase tracking-widest">Total</span>
                    </div>
                    <span className="text-xl sm:text-4xl font-black tracking-tighter">
                        ₹{grandTotal}
                    </span>
                </div>
            </div>

            {/* Workers Section */}
            <WorkerSection siteId={siteId} />
        </div>
    );
};

export default BillingTable;
