import React from 'react';
import GlassCard from './GlassCard';

/**
 * Apple-style Metric / Stat Card with prominent numbers and clean hierarchy
 */
export const GlassStat = ({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  variant = 'default', // 'default', 'emerald', 'amber', 'rose', 'purple'
  className = '',
  onClick,
}) => {
  const iconColors = {
    default: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200/50',
    amber: 'bg-amber-50 text-amber-600 border border-amber-200/50',
    rose: 'bg-rose-50 text-rose-600 border border-rose-200/50',
    purple: 'bg-purple-50 text-purple-600 border border-purple-200/50',
  };

  return (
    <GlassCard
      onClick={onClick}
      interactive={Boolean(onClick)}
      className={`p-5 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${iconColors[variant] || iconColors.default}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {trend && (
              <span className={`font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend}
              </span>
            )}
            {subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default GlassStat;
