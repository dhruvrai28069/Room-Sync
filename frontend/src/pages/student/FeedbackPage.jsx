import React, { useState } from 'react';
import api from '../../services/api';
import { MessageSquare, Star, CheckCircle, Send } from 'lucide-react';

const FeedbackPage = () => {
  const [overallRating, setOverallRating] = useState(5);
  const [sleepCompatibility, setSleepCompatibility] = useState(5);
  const [studyCompatibility, setStudyCompatibility] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [comments, setComments] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/students/feedback', {
        overallRating,
        sleepCompatibility,
        studyCompatibility,
        cleanlinessRating,
        comments
      });
      if (res.data.success) {
        setSuccessMsg('Thank you for providing roommate compatibility feedback!');
        setComments('');
      }
    } catch (err) {
      setErrorMsg('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 focus:outline-none hover:scale-125 transition-transform duration-150"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Post-Allocation Feedback</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Help evaluate and improve future matching accuracy.</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center space-x-3 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <StarRating value={overallRating} onChange={setOverallRating} label="Overall Roommate Experience" />
          <StarRating value={sleepCompatibility} onChange={setSleepCompatibility} label="Sleep Schedule Compatibility" />
          <StarRating value={studyCompatibility} onChange={setStudyCompatibility} label="Study Habit Compatibility" />
          <StarRating value={cleanlinessRating} onChange={setCleanlinessRating} label="Cleanliness Compatibility" />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Optional Comments & Experience Details
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share how living together is going or any suggestions for future allocations..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Roommate Feedback'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
