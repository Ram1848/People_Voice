import React from 'react';

/**
 * Animated audio waveform visualizer for speech listening state
 */
export const GlassWaveform = ({ isListening = false, bars = 16, className = '' }) => {
  const heights = [35, 60, 95, 45, 80, 100, 70, 40, 65, 90, 50, 85, 30, 75, 90, 40];

  return (
    <div className={`flex items-center justify-center gap-1 h-10 px-3 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => {
        const height = heights[i % heights.length];
        return (
          <span
            key={i}
            className={`
              w-1 rounded-full bg-gradient-to-t from-emerald-500 to-teal-400
              transition-all duration-200
            `}
            style={{
              height: isListening ? `${height}%` : '15%',
              animation: isListening
                ? `pulse ${(0.6 + (i % 5) * 0.15).toFixed(2)}s ease-in-out infinite alternate`
                : 'none',
              animationDelay: `${(i * 0.05).toFixed(2)}s`,
              opacity: isListening ? 0.9 : 0.25,
            }}
          />
        );
      })}
    </div>
  );
};

export default GlassWaveform;
