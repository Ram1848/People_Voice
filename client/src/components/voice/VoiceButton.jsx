import React from 'react';
import GlassVoiceButton from '../glass/GlassVoiceButton';
import GlassWaveform from '../glass/GlassWaveform';
import GlassBadge from '../glass/GlassBadge';

export const VoiceButton = ({
  isListening,
  isProcessing,
  onClick,
  uiState = 'READY',
  size = 'lg',
}) => {
  // Determine effective state
  const effectiveState = isListening 
    ? 'LISTENING' 
    : isProcessing 
      ? 'PROCESSING' 
      : uiState || 'READY';

  return (
    <div className="flex flex-col items-center justify-center my-4 select-none">
      {/* Liquid Voice Button Orb */}
      <GlassVoiceButton
        isListening={isListening}
        isProcessing={isProcessing}
        onClick={onClick}
        size={size === 'hero' ? 'hero' : size === 'lg' ? 'lg' : 'md'}
      />

      {/* Audio Waveform (Visible when listening) */}
      <div className="h-8 my-2 flex items-center justify-center">
        {effectiveState === 'LISTENING' ? (
          <GlassWaveform isListening={true} bars={20} />
        ) : effectiveState === 'PROCESSING' ? (
          <span className="text-xs font-semibold text-purple-700 animate-pulse tracking-wide">
            Understanding voice command with AI...
          </span>
        ) : effectiveState === 'CONFIRMATION' ? (
          <span className="text-xs font-semibold text-amber-700 tracking-wide">
            Confirmation required before modifying inventory
          </span>
        ) : effectiveState === 'SUCCESS' ? (
          <span className="text-xs font-semibold text-emerald-700 tracking-wide">
            Action completed successfully
          </span>
        ) : effectiveState === 'ERROR' ? (
          <span className="text-xs font-semibold text-rose-700 tracking-wide">
            Command could not be executed
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            Tap microphone to speak or click quick prompts below
          </span>
        )}
      </div>

      {/* Apple-style Capsule Status Pill */}
      <div className="mt-1">
        {effectiveState === 'LISTENING' ? (
          <GlassBadge variant="danger" size="md" dot>
            LISTENING
          </GlassBadge>
        ) : effectiveState === 'PROCESSING' ? (
          <GlassBadge variant="ai" size="md" dot>
            PROCESSING
          </GlassBadge>
        ) : effectiveState === 'CONFIRMATION' ? (
          <GlassBadge variant="amber" size="md" dot>
            CONFIRMATION
          </GlassBadge>
        ) : effectiveState === 'SUCCESS' ? (
          <GlassBadge variant="success" size="md" dot>
            SUCCESS
          </GlassBadge>
        ) : effectiveState === 'ERROR' ? (
          <GlassBadge variant="danger" size="md" dot>
            ERROR
          </GlassBadge>
        ) : (
          <GlassBadge variant="success" size="md" dot>
            READY
          </GlassBadge>
        )}
      </div>
    </div>
  );
};

export default VoiceButton;
