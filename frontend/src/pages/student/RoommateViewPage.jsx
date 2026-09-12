import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sparkles, Building, CheckCircle2, Lightbulb, AlertTriangle } from 'lucide-react';

const RoommateViewPage = () => {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllocation();
  }, []);

  const fetchAllocation = async () => {
    try {
      const res = await api.get('/students/my-allocation');
      if (res.data.success) {
        setAllocation(res.data);
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
        Fetching your room assignment & roommate compatibility details...
      </div>
    );
  }

  if (!allocation || !allocation.isAllocated) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm dark:shadow-xl">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
          <Building className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Room Allocation Finalized Yet</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Your hostel warden is currently processing questionnaire responses and generating optimal roommate groups. Check back soon!
        </p>
      </div>
    );
  }

  const { hostelName, blockName, roomNumber, capacity, groupScore, roommates } = allocation.allocationDetails;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Room Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30">
            {roomNumber}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{hostelName}</h1>
            <p className="text-indigo-200 text-sm font-semibold">{blockName} • Room {roomNumber} ({capacity}-Bed Room)</p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-indigo-400/40 rounded-xl px-6 py-3 text-center shadow-md">
          <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider block">Group Compatibility Score</span>
          <span className="text-3xl font-black text-emerald-400">
            {groupScore}%
          </span>
        </div>
      </div>

      {/* Roommates Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Your Assigned Roommates & Match Rationale</span>
        </h2>

        {roommates.length === 0 ? (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-sm text-center">
            You currently have no roommates assigned to this room.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roommates.map((rm) => (
              <div key={rm.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors duration-200">
                {/* Roommate Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                      {rm.firstName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{rm.firstName} {rm.lastName}</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{rm.course} • {rm.branch} ({rm.yearOfStudy} Year)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{rm.compatibilityScore}%</span>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Match Score</span>
                  </div>
                </div>

                {/* Match Highlights */}
                {rm.explanation?.highlights?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Why You Were Matched:</span>
                    </span>
                    <ul className="space-y-1">
                      {rm.explanation.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-lg px-3 py-1.5 font-medium flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills Can Teach / Growth Exchange */}
                {rm.skillsCanTeach?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center space-x-1">
                      <Lightbulb className="w-4 h-4" />
                      <span>Skills They Can Teach:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rm.skillsCanTeach.map((sk, i) => (
                        <span key={i} className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Potential Conflicts / Differences */}
                {rm.conflicts?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Potential Differences to Keep in Mind:</span>
                    </span>
                    <ul className="space-y-1">
                      {rm.conflicts.map((c, i) => (
                        <li key={i} className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-1.5 font-medium">
                          {c.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoommateViewPage;
