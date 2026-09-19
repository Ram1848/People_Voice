import React from 'react';
import GlassVoiceButton from '../glass/GlassVoiceButton';
import GlassWaveform from '../glass/GlassWaveform';
import GlassBadge from '../glass/GlassBadge';

export const VoiceButton = ({
  isListening,
  isProcessing,
  onClick,
  state = 'IDLE',
  size = 'lg',
}) => {
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
        {isListening ? (
          <GlassWaveform isListening={true} bars={20} />
        ) : isProcessing ? (
          <span className="text-xs font-semibold text-purple-700 animate-pulse tracking-wide">
            Understanding voice command with AI...
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            Tap microphone to speak or click quick prompts below
          </span>
        )}
      </div>

      {/* Apple-style Capsule Status Pill */}
      <div className="mt-1">
        {isListening ? (
          <GlassBadge variant="danger" size="md" dot>
            LISTENING — Speak now
          </GlassBadge>
        ) : isProcessing ? (
          <GlassBadge variant="ai" size="md" dot>
            PROCESSING COMMAND
          </GlassBadge>
        ) : (
          <GlassBadge variant="success" size="md" dot>
            AI ASSISTANT READY
          </GlassBadge>
        )}
      </div>
    </div>
  );
};

export default VoiceButton;
