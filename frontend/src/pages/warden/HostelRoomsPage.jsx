import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building, Plus, Lock, Unlock } from 'lucide-react';

const HostelRoomsPage = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [blockId, setBlockId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('2');

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      if (res.data.success) {
        setHostels(res.data.hostels);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/hostels/rooms', { blockId, roomNumber, capacity });
      if (res.data.success) {
        setShowModal(false);
        setRoomNumber('');
        fetchHostels();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create room');
    }
  };

  const toggleRoomLock = async (roomId, currentLock) => {
    try {
      await api.patch(`/hostels/rooms/${roomId}/lock`, { isLocked: !currentLock });
      fetchHostels();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading Hostel Rooms Grid...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Hostel & Room Capacity Grid</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Configure room capacity, maintenance status, and administrative locks.</p>
        </div>
      </div>

      {hostels.map((h) => (
        <div key={h.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{h.name}</h2>
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                {h.genderType} Hostel
              </span>
            </div>
          </div>

          {h.blocks.map((block) => (
            <div key={block.id} className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">{block.name}</h3>
                <button
                  onClick={() => {
                    setBlockId(block.id);
                    setShowModal(true);
                  }}
                  className="flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {block.rooms.map((room) => (
                  <div key={room.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white">{room.roomNumber}</span>
                      <button
                        onClick={() => toggleRoomLock(room.id, room.isLocked)}
                        className={`p-1 rounded ${
                          room.isLocked ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {room.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Cap: <span className="text-slate-900 dark:text-slate-200 font-bold">{room.capacity} Beds</span>
                    </div>

                    <div className="pt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        room.status === 'OCCUPIED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Add Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. A-105"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bed Capacity</label>
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                >
                  <option value="2">2 Beds</option>
                  <option value="3">3 Beds</option>
                  <option value="4">4 Beds</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelRoomsPage;
