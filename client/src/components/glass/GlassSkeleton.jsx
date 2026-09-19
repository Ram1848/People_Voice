import React from 'react';

/**
 * Apple-style Frosted Skeleton Shimmer loader
 */
export const GlassSkeleton = ({ className = '', rounded = 'rounded-2xl' }) => {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-slate-200/50 backdrop-blur-sm
        before:absolute before:inset-0
        before:-translate-x-full
        before:animate-[shimmer_1.8s_infinite]
        before:bg-gradient-to-r
        before:from-transparent before:via-white/50 before:to-transparent
        ${rounded}
        ${className}
      `}
    />
  );
};

export default GlassSkeleton;
