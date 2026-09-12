import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Building, Sparkles, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

const WardenDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const aRes = await api.get('/admin/analytics');
      if (aRes.data.success) {
        setAnalytics(aRes.data.analytics);
      }

      const hRes = await api.get('/hostels');
      if (hRes.data.success) {
        setHostels(hRes.data.hostels);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading Control Center Overview...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Warden Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Hostel roommate compatibility management & allocation optimization</p>
        </div>
        <Link
          to="/warden/matching-studio"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition shrink-0"
        >
          <Sparkles className="w-5 h-5" />
          <span>Launch Matching Studio</span>
        </Link>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl transition-colors duration-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.totalStudents || 0}</div>
          <p className="text-xs text-slate-400 font-medium mt-1">Registered roster</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl transition-colors duration-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Survey Completion</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{analytics?.completionPercentage || 0}%</div>
          <p className="text-xs text-slate-400 font-medium mt-1">{analytics?.completedQuestionnaires || 0} of {analytics?.totalStudents || 0} complete</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl transition-colors duration-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rooms Capacity</span>
            <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.totalRooms || 0}</div>
          <p className="text-xs text-slate-400 font-medium mt-1">{analytics?.totalAllocated || 0} beds assigned</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl transition-colors duration-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Change Requests</span>
            <RefreshCw className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{analytics?.pendingChangeRequests || 0}</div>
          <p className="text-xs text-slate-400 font-medium mt-1">Pending warden review</p>
        </div>
      </div>

      {/* Managed Hostels Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-200">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Hostels & Blocks</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostels.map((h) => (
            <div key={h.id} className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{h.name}</h3>
                  <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    {h.genderType} Hostel
                  </span>
                </div>
                <Link
                  to="/warden/matching-studio"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                >
                  <span>Run Match</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 font-medium">
                <div>Blocks: <span className="text-slate-900 dark:text-white font-bold">{h.blocks?.length || 0}</span></div>
                <div>
                  Total Rooms: <span className="text-slate-900 dark:text-white font-bold">
                    {h.blocks?.reduce((acc, b) => acc + (b.rooms?.length || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
