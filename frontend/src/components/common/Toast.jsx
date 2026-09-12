import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const bgStyles = {
    success: 'bg-emerald-950 border-emerald-800 text-emerald-200',
    error: 'bg-rose-950 border-rose-800 text-rose-200',
    warning: 'bg-amber-950 border-amber-800 text-amber-200',
  };

  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
  }[type] || CheckCircle2;

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 border rounded-xl shadow-2xl backdrop-blur transition-all ${bgStyles[type]}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium pr-2">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
