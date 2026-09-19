import React from 'react';

const VARIANTS = {
  // Stock status
  IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  LOW_STOCK: 'bg-amber-50 text-amber-700 border-amber-200',
  OUT_OF_STOCK: 'bg-rose-50 text-rose-700 border-rose-200',

  // Transaction type
  ADD: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REMOVE: 'bg-indigo-50 text-indigo-700 border-indigo-200',

  // Confidence
  HIGH: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  LOW: 'bg-rose-50 text-rose-700 border-rose-200',

  // Generic status
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const DOT_COLORS = {
  IN_STOCK: 'bg-emerald-500',
  LOW_STOCK: 'bg-amber-500',
  OUT_OF_STOCK: 'bg-rose-500',
  ADD: 'bg-emerald-500',
  REMOVE: 'bg-indigo-500',
  HIGH: 'bg-emerald-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-rose-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400',
  primary: 'bg-indigo-500',
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export const Badge = ({
  variant = 'neutral',
  size = 'sm',
  children,
  dot = false,
  className = '',
}) => {
  const variantClass = VARIANTS[variant] || VARIANTS.neutral;
  const dotColor = DOT_COLORS[variant] || 'bg-slate-400';
  const sizeClass = SIZES[size] || SIZES.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${variantClass} ${sizeClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
};

export default Badge;
