import React, { useState } from 'react';
import api from '../../services/api';
import { RefreshCw, CheckCircle, AlertCircle, Send } from 'lucide-react';

const RoomChangePage = () => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/students/room-change', { reason });
      if (res.data.success) {
        setSuccessMsg('Your room change request has been submitted to the warden.');
        setReason('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center border border-teal-200 dark:border-teal-800">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Room Change Request</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Request a room modification or transfer for warden review.</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center space-x-3 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl flex items-center space-x-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Reason for Room Change Request
            </label>
            <textarea
              required
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you are requesting a room change (e.g., lifestyle adjustment, study environment needs, medical consideration)..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || reason.length < 10}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl transition shadow-lg shadow-teal-600/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting Request...' : 'Submit Request to Warden'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomChangePage;
