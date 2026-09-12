import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { RefreshCw, CheckCircle, XCircle, Clock, ShieldAlert, FileText } from 'lucide-react';

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/requests');
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/admin/requests/${id}`, {
        status,
        reviewNote: `Processed by Warden as ${status}`
      });
      if (res.data.success) {
        fetchRequests();
      }
    } catch (err) {
      alert('Failed to update request status');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading Student Room Change Requests...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Room Change Requests</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">Review student requests and approve room transfers.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500 dark:text-slate-400 text-sm font-semibold shadow-sm space-y-2">
          <FileText className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
          <p className="text-base text-slate-700 dark:text-slate-300 font-bold">No Room Change Requests Filed Yet</p>
          <p className="text-xs text-slate-400 font-normal">Student room change requests submitted post-allocation will appear here for warden approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl space-y-3.5 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {req.student.firstName} {req.student.lastName} ({req.student.studentIdNo})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{req.student.course} • {req.student.branch}</p>
                </div>

                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  req.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                  (req.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800')
                }`}>
                  {req.status}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-medium">
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Reason for Request:</span>
                "{req.reason}"
              </div>

              {req.status === 'PENDING' && (
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl border border-red-200 dark:border-red-800 hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Request</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
