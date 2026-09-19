import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-slate-50',
  iconColor = 'text-slate-600',
  valueColor = 'text-slate-900',
  badge = null,
  badgeColor = 'bg-slate-100 text-slate-700',
  onClick = null,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm transition-all ${
        onClick ? 'hover:border-slate-300 hover:shadow-md cursor-pointer group' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2.5 flex items-baseline justify-between">
        <span className={`text-2xl sm:text-3xl font-black tracking-tight ${valueColor}`}>
          {value !== undefined && value !== null ? value : '—'}
        </span>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[11px] text-slate-400 font-medium mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
