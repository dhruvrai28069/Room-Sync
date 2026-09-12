import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sparkles, Building, Lock, Unlock, ArrowRightLeft, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const MatchingStudioPage = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [allocationResult, setAllocationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [swapSource, setSwapSource] = useState(null);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      if (res.data.success && res.data.hostels.length > 0) {
        setHostels(res.data.hostels);
        setSelectedHostelId(res.data.hostels[0].id);
      }
    } catch (err) {
      setErrorMsg('Failed to load hostels');
    }
  };

  const handleGenerateAllocation = async () => {
    if (!selectedHostelId) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/matching/generate', { hostelId: selectedHostelId });
      if (res.data.success) {
        setAllocationResult(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate allocation');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAllocation = async () => {
    if (!allocationResult || !selectedHostelId) return;
    setApproving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/matching/approve', {
        hostelId: selectedHostelId,
        allocations: allocationResult.allocations,
        note: 'Approved by Warden via Matching Studio'
      });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to approve allocation');
    } finally {
      setApproving(false);
    }
  };

  const toggleStudentLock = (roomId, studentId) => {
    if (!allocationResult) return;
    const updatedAllocations = allocationResult.allocations.map(roomGroup => {
      if (roomGroup.roomId === roomId) {
        const updatedOccupants = roomGroup.occupants.map(s => {
          if (s.id === studentId) {
            return { ...s, isLocked: !s.isLocked };
          }
          return s;
        });
        return { ...roomGroup, occupants: updatedOccupants };
      }
      return roomGroup;
    });
    setAllocationResult({ ...allocationResult, allocations: updatedAllocations });
  };

  const initiateSwap = (student, roomGroup) => {
    if (!swapSource) {
      setSwapSource({ student, roomGroup });
    } else {
      executeSwap(swapSource.student, swapSource.roomGroup, student, roomGroup);
      setSwapSource(null);
    }
  };

  const executeSwap = (st1, room1, st2, room2) => {
    if (room1.roomId === room2.roomId) return;

    const updatedAllocations = allocationResult.allocations.map(r => {
      if (r.roomId === room1.roomId) {
        const occupants = r.occupants.filter(s => s.id !== st1.id).concat(st2);
        return { ...r, occupants };
      }
      if (r.roomId === room2.roomId) {
        const occupants = r.occupants.filter(s => s.id !== st2.id).concat(st1);
        return { ...r, occupants };
      }
      return r;
    });

    setAllocationResult({ ...allocationResult, allocations: updatedAllocations });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Studio Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2.5">
            <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Warden Matching Studio</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
            Data-driven group compatibility optimizer with warden overrides & locking controls.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedHostelId}
            onChange={(e) => setSelectedHostelId(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {hostels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          <button
            type="button"
            disabled={loading}
            onClick={handleGenerateAllocation}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Optimizing...' : 'Run Compatibility Optimizer'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl flex items-center space-x-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {swapSource && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/90 border border-indigo-200 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 rounded-2xl flex items-center justify-between text-sm font-medium animate-pulse shadow-sm">
          <span>
            SWAP MODE: Selected <strong className="text-indigo-700 dark:text-white font-extrabold">{swapSource.student.firstName} {swapSource.student.lastName}</strong> from Room {swapSource.roomGroup.roomNumber}. Click on another student card to perform swap!
          </span>
          <button
            onClick={() => setSwapSource(null)}
            className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow"
          >
            Cancel Swap
          </button>
        </div>
      )}

      {/* Generated Allocation Studio Grid */}
      {allocationResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-sm">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Generated Layout for <strong className="text-slate-900 dark:text-white font-bold">{allocationResult.hostelName}</strong>: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{allocationResult.allocatedRoomsCount} Rooms</span>
            </div>
            <button
              onClick={handleApproveAllocation}
              disabled={approving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{approving ? 'Finalizing...' : 'Approve & Finalize Version'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allocationResult.allocations.map((roomGroup) => (
              <div
                key={roomGroup.roomId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between space-y-4 transition-colors duration-200"
              >
                {/* Room Score Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Room {roomGroup.roomNumber}
                    </h3>
                    <p className="text-xs font-medium text-slate-400">{roomGroup.blockName} • Capacity {roomGroup.capacity}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {roomGroup.groupScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Group Score</span>
                  </div>
                </div>

                {/* Occupants Cards */}
                <div className="space-y-2.5">
                  {roomGroup.occupants.map((st) => {
                    const isSelectedForSwap = swapSource?.student?.id === st.id;

                    return (
                      <div
                        key={st.id}
                        className={`p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                          isSelectedForSwap
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 ring-2 ring-indigo-500'
                            : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                            <span>{st.firstName} {st.lastName}</span>
                            {!st.isDataComplete && (
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800">
                                Partial Data
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{st.course} • {st.branch}</p>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => toggleStudentLock(roomGroup.roomId, st.id)}
                            title={st.isLocked ? 'Student Locked to Room' : 'Lock Student'}
                            className={`p-1.5 rounded-lg border font-bold ${
                              st.isLocked
                                ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {st.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => initiateSwap(st, roomGroup)}
                            title="Swap Student"
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Conflicts Warning */}
                {roomGroup.conflicts && roomGroup.conflicts.length > 0 && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-900 dark:text-amber-300 text-[11px] font-medium">
                    <span className="font-bold flex items-center space-x-1 mb-1 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Potential Room Clashes:</span>
                    </span>
                    <ul className="space-y-0.5">
                      {roomGroup.conflicts.map((c, i) => (
                        <li key={i}>• {c.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingStudioPage;
