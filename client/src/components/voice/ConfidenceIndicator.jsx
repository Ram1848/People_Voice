import React from 'react';

export const ConfidenceIndicator = ({ confidence = 0.95, level = null, showBar = true }) => {
  const pct = Math.round((confidence || 0.95) * 100);
  const calculatedLevel = level || (pct >= 90 ? 'HIGH' : pct >= 70 ? 'MEDIUM' : 'LOW');

  const config = {
    HIGH: {
      label: 'High Confidence',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
    },
    MEDIUM: {
      label: 'Medium Confidence',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      bar: 'bg-amber-500',
    },
    LOW: {
      label: 'Low Confidence',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      bar: 'bg-rose-500',
    },
  }[calculatedLevel] || {
    label: 'Normal',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    bar: 'bg-slate-500',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
        {config.label} ({pct}%)
      </span>
      {showBar && (
        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
          <div 
            className={`h-full ${config.bar} transition-all duration-300`} 
            style={{ width: `${pct}%` }} 
          />
        </div>
      )}
    </div>
  );
};

export default ConfidenceIndicator;
