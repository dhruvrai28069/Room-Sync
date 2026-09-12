import React from 'react';
import api from '../../services/api';
import { Download, FileSpreadsheet, CheckCircle, FileText } from 'lucide-react';

const AllocationsPage = () => {
  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'smart_hostel_allocation_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV report');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Allocation Versions & Export Center</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Export official printable room lists and audit reports.</p>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 text-center">
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium max-w-xl mx-auto">
            Download full hostel roommate assignment records formatted for printing or hostel notice board publishing.
          </p>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2.5 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Official CSV Room List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllocationsPage;
