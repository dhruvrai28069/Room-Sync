import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardList, CheckCircle, ArrowRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

const QuestionnairePage = () => {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchQuestionnaire();
  }, []);

  const fetchQuestionnaire = async () => {
    try {
      const res = await api.get('/questionnaire/active');
      if (res.data.success) {
        setQuestionnaire(res.data.questionnaire);
        
        try {
          const myRes = await api.get('/questionnaire/my-response');
          if (myRes.data.success && myRes.data.response) {
            const existingMap = {};
            myRes.data.response.items.forEach(item => {
              try {
                existingMap[item.questionId] = JSON.parse(item.answerValue);
              } catch (e) {
                existingMap[item.questionId] = item.answerValue;
              }
            });
            setAnswers(existingMap);
          }
        } catch (e) {
          // No prior response
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load active questionnaire');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading Compatibility Assessment...
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
        No active questionnaire available right now.
      </div>
    );
  }

  const categoriesMap = {};
  questionnaire.questions.forEach((q) => {
    if (!categoriesMap[q.category]) {
      categoriesMap[q.category] = [];
    }
    categoriesMap[q.category].push(q);
  });

  const categories = Object.keys(categoriesMap);
  const currentCategory = categories[currentCategoryIndex];
  const currentQuestions = categoriesMap[currentCategory] || [];

  const handleSelectOption = (qId, optionVal) => {
    setAnswers({ ...answers, [qId]: optionVal });
  };

  const handleMultiChoiceToggle = (qId, optionVal) => {
    const current = answers[qId] || [];
    const list = Array.isArray(current) ? current : [current];
    if (list.includes(optionVal)) {
      setAnswers({ ...answers, [qId]: list.filter(v => v !== optionVal) });
    } else {
      setAnswers({ ...answers, [qId]: [...list, optionVal] });
    }
  };

  const handleScaleSelect = (qId, num) => {
    setAnswers({ ...answers, [qId]: String(num) });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.post('/questionnaire/submit', { answers });
      if (res.data.success) {
        setSuccessMsg('Your compatibility questionnaire has been saved and submitted successfully!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit questionnaire');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCategoryName = (cat) => {
    return cat.replace('_', ' ');
  };

  const progressPercent = Math.round(((currentCategoryIndex + 1) / categories.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2.5">
              <ClipboardList className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <span>Roommate Compatibility Assessment</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Section {currentCategoryIndex + 1} of {categories.length}: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatCategoryName(currentCategory)}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
            <span className="text-xs text-slate-400 font-medium block">Progress</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full mt-4 overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center space-x-3 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Questions Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors duration-200">
        {currentQuestions.map((q, idx) => {
          const currentAnswer = answers[q.id];

          return (
            <div key={q.id} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3">
              <div className="flex items-start space-x-2.5">
                <span className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-700/50">
                  Q{idx + 1}
                </span>
                <p className="text-slate-900 dark:text-white font-bold text-base">{q.questionText}</p>
              </div>

              {/* SINGLE CHOICE */}
              {q.questionType === 'SINGLE_CHOICE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {q.options.map((opt) => {
                    const isSelected = currentAnswer === opt.optionValue;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.optionValue)}
                        className={`text-left px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.optionText}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MULTI CHOICE */}
              {q.questionType === 'MULTI_CHOICE' && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {q.options.map((opt) => {
                    const list = Array.isArray(currentAnswer) ? currentAnswer : (currentAnswer ? [currentAnswer] : []);
                    const isSelected = list.includes(opt.optionValue);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleMultiChoiceToggle(q.id, opt.optionValue)}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{opt.optionText}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SCALE (1 to 5) */}
              {q.questionType === 'SCALE' && (
                <div className="flex items-center space-x-3 pt-2">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = String(currentAnswer) === String(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleScaleSelect(q.id, num)}
                        className={`w-12 h-12 rounded-xl border font-black text-base transition ${
                          isSelected
                            ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:border-indigo-400'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TEXT */}
              {q.questionType === 'TEXT' && (
                <input
                  type="text"
                  value={currentAnswer || ''}
                  onChange={(e) => handleSelectOption(q.id, e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          );
        })}

        {/* Wizard Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            disabled={currentCategoryIndex === 0}
            onClick={() => setCurrentCategoryIndex(currentCategoryIndex - 1)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentCategoryIndex < categories.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentCategoryIndex(currentCategoryIndex + 1)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30"
            >
              <span>Next Section</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Saving Assessment...' : 'Finalize & Submit Assessment'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;
