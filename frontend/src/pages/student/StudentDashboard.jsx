import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ClipboardList, Sparkles, RefreshCw, MessageSquare, CheckCircle, Clock, Building } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const student = user?.student;

  const [questionnaireStatus, setQuestionnaireStatus] = useState(false);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const qRes = await api.get('/questionnaire/my-response');
      if (qRes.data.success && qRes.data.response) {
        setQuestionnaireStatus(qRes.data.response.isComplete);
      }

      const aRes = await api.get('/students/my-allocation');
      if (aRes.data.success) {
        setAllocation(aRes.data);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            Welcome back, {student?.firstName || 'Student'}! 👋
          </h1>
          <p className="text-indigo-200 text-sm font-medium mt-1">
            {student?.course} ({student?.branch}) • Roll No: <span className="font-mono text-indigo-300 font-bold">{student?.studentIdNo}</span>
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Survey Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Survey Status</span>
            <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-center space-x-2">
            {questionnaireStatus ? (
              <>
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
              </>
            ) : (
              <>
                <Clock className="w-6 h-6 text-amber-500" />
                <span className="text-xl font-bold text-amber-500">Pending</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {questionnaireStatus
              ? 'Your responses are active in the matching engine.'
              : 'Complete your survey to receive personalized roommate recommendations.'}
          </p>
          <Link
            to="/student/questionnaire"
            className="inline-block w-full text-center text-xs font-bold px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            {questionnaireStatus ? 'Update Survey Responses' : 'Start Compatibility Assessment'}
          </Link>
        </div>

        {/* Room Assignment */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Room Allocation</span>
            <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            {allocation?.isAllocated ? (
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {allocation.allocationDetails.roomNumber} ({allocation.allocationDetails.blockName})
              </span>
            ) : (
              <span className="text-lg font-bold text-slate-400">Not Assigned Yet</span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {allocation?.isAllocated
              ? `Group Score: ${allocation.allocationDetails.groupScore}%`
              : 'Wardens are reviewing roommate recommendations.'}
          </p>
          <Link
            to="/student/roommate-view"
            className="inline-block w-full text-center text-xs font-bold px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition shadow-md shadow-purple-600/20"
          >
            View Room & Roommate Details
          </Link>
        </div>

        {/* Change Request & Feedback */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Post-Allocation</span>
            <RefreshCw className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="space-y-2">
            <Link
              to="/student/change-request"
              className="flex items-center justify-between text-xs font-bold px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition"
            >
              <span>Submit Room Change</span>
              <RefreshCw className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </Link>
            <Link
              to="/student/feedback"
              className="flex items-center justify-between text-xs font-bold px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition"
            >
              <span>Submit Roommate Feedback</span>
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
