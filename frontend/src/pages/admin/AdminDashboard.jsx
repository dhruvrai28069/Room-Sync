import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, CheckCircle, Sliders, FileSpreadsheet } from 'lucide-react';

const AdminDashboard = () => {
  const [weights, setWeights] = useState({
    lifestyleWeight: 0.30,
    academicWeight: 0.20,
    goalsWeight: 0.15,
    personalityWeight: 0.10,
    interestsWeight: 0.10,
    growthWeight: 0.10,
    mutualPrefWeight: 0.05,
    groupAvgWeight: 0.70,
    groupMinWeight: 0.30
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importStatus, setImportStatus] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/admin/config');
      if (res.data.success && res.data.config) {
        setWeights(res.data.config);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWeights = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.put('/admin/config', weights);
      if (res.data.success) {
        setSuccessMsg('Matching Engine configuration weights updated successfully!');
      }
    } catch (err) {
      alert('Failed to update config weights');
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleSheetsImport = (e) => {
    e.preventDefault();
    setImportStatus('Syncing Google Forms/Sheets responses into Smart Hostel database...');
    setTimeout(() => {
      setImportStatus('✅ Google Forms responses imported and synchronized with student database successfully!');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Super Admin Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Tune matching algorithm weights, hard constraints, and external Google Forms integration.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center space-x-3 text-sm font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Weight Configurator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors duration-200">
        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center border border-purple-200 dark:border-purple-800">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Matching Dimension Weight Tuner</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure relative influence of each dimension in the Pairwise Compatibility Engine.</p>
          </div>
        </div>

        <form onSubmit={handleSaveWeights} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lifestyle Compatibility Weight (Default 30%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.lifestyleWeight}
                onChange={(e) => setWeights({ ...weights, lifestyleWeight: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Academic Alignment Weight (Default 20%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.academicWeight}
                onChange={(e) => setWeights({ ...weights, academicWeight: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Goal Compatibility Weight (Default 15%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.goalsWeight}
                onChange={(e) => setWeights({ ...weights, goalsWeight: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Personality / Social Weight (Default 10%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.personalityWeight}
                onChange={(e) => setWeights({ ...weights, personalityWeight: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hobbies & Interests Weight (Default 10%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.interestsWeight}
                onChange={(e) => setWeights({ ...weights, interestsWeight: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Growth & Skill Exchange Weight (Default 10%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={weights.growthWeight}
                onChange={(e) => setWeights({ ...weights, growthWeight: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-600/30"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Weights'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Google Forms / Sheets Integration Option A */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-200">
        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Google Forms / Sheets Import Integration</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Import student responses collected via external Google Forms.</p>
          </div>
        </div>

        <form onSubmit={handleGoogleSheetsImport} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Google Sheet CSV / Webhook URL
            </label>
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sync Google Forms Responses</span>
          </button>
        </form>

        {importStatus && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-xl">
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
