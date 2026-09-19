import React from 'react';

/**
 * Apple-inspired Liquid Glass Input
 */
export const GlassInput = React.forwardRef(({
  className = '',
  icon: Icon,
  error,
  label,
  helperText,
  id,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          ref={ref}
          className={`
            w-full py-2.5 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400
            bg-white/60 backdrop-blur-xl
            border ${error ? 'border-rose-400' : 'border-white/80'}
            shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]
            focus:outline-none focus:bg-white/90 focus:border-emerald-500/60
            focus:ring-4 focus:ring-emerald-500/10
            transition-all duration-200
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;
