import React from 'react';

/**
 * Apple-inspired Liquid Glass Card
 */
export const GlassCard = ({
  children,
  className = '',
  hover = true,
  interactive = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-3xl p-6
        bg-white/70 backdrop-blur-2xl
        border border-white/80
        shadow-[0_4px_24px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.95)]
        ${hover ? 'hover:bg-white/85 hover:border-white hover:shadow-[0_12px_36px_-4px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,1)] hover:-translate-y-0.5' : ''}
        ${interactive ? 'cursor-pointer active:scale-[0.99]' : ''}
        transition-all duration-300 ease-out
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
