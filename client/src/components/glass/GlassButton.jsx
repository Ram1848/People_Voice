import React from 'react';

/**
 * Apple-inspired Liquid Glass Button
 * Variants: primary (emerald gradient), secondary (glass surface), ghost, danger
 * Sizes: sm, md, lg
 */
export const GlassButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-2xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-3xl gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:brightness-105 active:scale-[0.98] border-t border-emerald-400/40',
    secondary:
      'bg-white/60 text-slate-800 backdrop-blur-xl border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:bg-white/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 active:scale-[0.98]',
    danger:
      'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_4px_14px_rgba(244,63,94,0.3)] hover:brightness-105 active:scale-[0.98] border-t border-rose-400/40',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 select-none
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${disabled ? 'opacity-40 cursor-not-allowed filter grayscale pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
};

export default GlassButton;
