import React from 'react';

/**
 * Apple-inspired Liquid Glass Badge / Pill
 * Variants: success, warning, danger, neutral, ai, info
 */
export const GlassBadge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
    lg: 'text-sm px-3.5 py-1.5 rounded-full font-semibold',
  };

  const variantStyles = {
    neutral: 'bg-slate-100/70 text-slate-700 border border-slate-200/60 backdrop-blur-md',
    success: 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 backdrop-blur-md',
    warning: 'bg-amber-500/10 text-amber-800 border border-amber-500/20 backdrop-blur-md',
    danger: 'bg-rose-500/10 text-rose-800 border border-rose-500/20 backdrop-blur-md',
    info: 'bg-sky-500/10 text-sky-800 border border-sky-500/20 backdrop-blur-md',
    ai: 'bg-gradient-to-r from-purple-500/10 to-emerald-500/10 text-purple-900 border border-purple-500/20 backdrop-blur-md shadow-[0_0_12px_rgba(168,85,247,0.1)]',
  };

  const dotStyles = {
    neutral: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500 animate-pulse',
    danger: 'bg-rose-500 animate-ping',
    info: 'bg-sky-500',
    ai: 'bg-purple-500 animate-pulse',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 leading-none select-none
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.neutral}
        ${className}
      `}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant] || dotStyles.neutral}`} />}
      {children}
    </span>
  );
};

export default GlassBadge;
