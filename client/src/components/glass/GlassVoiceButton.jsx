import React from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

/**
 * Apple-inspired Liquid Glass Voice Button
 * States:
 *  - idle: translucent glass with subtle pulse border
 *  - listening: active glowing emerald orb with ripple rings
 *  - processing: soft purple breathe with spinning loader
 */
export const GlassVoiceButton = ({
  isListening = false,
  isProcessing = false,
  onClick,
  disabled = false,
  size = 'lg', // 'sm', 'md', 'lg', 'hero'
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-11 h-11 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-20 h-20 text-xl',
    hero: 'w-28 h-28 text-3xl',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    hero: 'w-11 h-11',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Dynamic Ambient Pulsing Rings when Listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping -z-10" />
          <span className="absolute -inset-2 rounded-full bg-gradient-to-tr from-emerald-500/30 to-teal-400/20 blur-xl animate-pulse -z-10" />
          <span className="absolute -inset-4 rounded-full bg-emerald-500/10 blur-2xl -z-10" />
        </>
      )}

      {/* Processing Ambient Glow */}
      {isProcessing && (
        <span className="absolute -inset-2 rounded-full bg-gradient-to-tr from-purple-500/30 to-emerald-400/20 blur-xl animate-pulse -z-10" />
      )}

      {/* Main Glass Button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
        className={`
          relative rounded-full flex items-center justify-center select-none
          transition-all duration-300 ease-out active:scale-95
          ${sizeStyles[size] || sizeStyles.lg}
          ${
            isListening
              ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_0_35px_rgba(244,63,94,0.4)] border-2 border-white/60'
              : isProcessing
              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_0_35px_rgba(147,51,234,0.35)] border-2 border-white/60'
              : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] border-2 border-emerald-400/50 hover:scale-105'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        `}
      >
        {isProcessing ? (
          <Loader2 className={`${iconSizes[size] || iconSizes.lg} animate-spin`} />
        ) : isListening ? (
          <Square className={`${iconSizes[size] || iconSizes.lg} fill-current`} />
        ) : (
          <Mic className={`${iconSizes[size] || iconSizes.lg}`} />
        )}
      </button>
    </div>
  );
};

export default GlassVoiceButton;
