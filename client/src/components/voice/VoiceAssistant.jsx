import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Globe
} from 'lucide-react';
import { 
  sendVoiceCommand, 
  confirmVoiceCommand, 
  cancelVoiceCommand
} from '../../services/voiceService.js';
import VoiceButton from './VoiceButton';
import TranscriptCard from './TranscriptCard';
import CommandUnderstandingCard from './CommandUnderstandingCard';
import ConfirmationCard from './ConfirmationCard';
import VoiceResponseCard from './VoiceResponseCard';
import VoiceHistory from './VoiceHistory';
import GlassCard from '../glass/GlassCard';
import GlassBadge from '../glass/GlassBadge';

export const VoiceAssistant = ({ 
  voiceRecognition, 
  onInventoryUpdated,
  compact = false 
}) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
    speakText,
    language,
    setLanguage
  } = voiceRecognition;

  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Auto-submit after voice finishes listening
  useEffect(() => {
    if (transcript) {
      setTextInput(transcript);
      handleExecute(transcript, 'VOICE', false);
    }
  }, [transcript]);

  // Main command executor
  const handleExecute = async (cmdToRun, source = 'TEXT', confirmed = false) => {
    const cleanCmd = (cmdToRun || textInput).trim();
    if (!cleanCmd) return;

    setIsProcessing(true);
    setIsEditing(false);
    if (!confirmed) {
      setCurrentResponse(null);
      setPendingConfirmation(null);
    }

    try {
      const response = await sendVoiceCommand(cleanCmd, source, confirmed);

      // Check if backend requires confirmation before DB update
      if (response.requiresConfirmation && !confirmed) {
        setPendingConfirmation(response);
        if (ttsEnabled && response.spokenMessage) {
          speakText(response.spokenMessage);
        }
        return;
      }

      // Successful execution or read-only business response
      setCurrentResponse(response);
      setPendingConfirmation(null);

      if (ttsEnabled && response.spokenMessage) {
        speakText(response.spokenMessage);
      }

      // Add to session history
      setSessionHistory((prev) => [
        {
          id: Date.now(),
          command: cleanCmd,
          intent: response.intent || response.parsed?.action,
          response,
          timestamp: new Date(),
          confidence: response.parsed?.confidence,
        },
        ...prev,
      ]);

      if (onInventoryUpdated) {
        onInventoryUpdated(response);
      }
    } catch (err) {
      const errData = err.response?.data || {
        success: false,
        message: err.message || 'Error executing voice command. Please try again.',
        spokenMessage: 'Could not execute command. Please verify your request.',
      };
      setCurrentResponse(errData);
      setPendingConfirmation(null);

      if (ttsEnabled && errData.spokenMessage) {
        speakText(errData.spokenMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm Pending Command via ID
  const handleConfirmPending = async (commandId, confirmedQuantity) => {
    setConfirmLoading(true);
    try {
      const res = await confirmVoiceCommand(commandId, confirmedQuantity);
      setCurrentResponse(res);
      setPendingConfirmation(null);

      if (ttsEnabled && res.spokenMessage) {
        speakText(res.spokenMessage);
      }

      setSessionHistory((prev) => [
        {
          id: Date.now(),
          command: pendingConfirmation?.command?.product || 'Confirmed Command',
          intent: pendingConfirmation?.intent || 'CONFIRMED',
          status: 'CONFIRMED',
          response: res,
          timestamp: new Date(),
        },
        ...prev,
      ]);

      if (onInventoryUpdated) {
        onInventoryUpdated(res);
      }
    } catch (err) {
      const errData = err.response?.data || {
        success: false,
        message: err.message || 'Failed to confirm command.',
      };
      setCurrentResponse(errData);
      setPendingConfirmation(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Cancel Pending Command via ID
  const handleCancelPending = async (commandId) => {
    try {
      if (commandId) {
        await cancelVoiceCommand(commandId);
      }
      setPendingConfirmation(null);
      setCurrentResponse({
        success: true,
        message: 'Command cancelled. No database changes were made.',
        spokenMessage: 'Command cancelled.',
      });
      if (ttsEnabled) {
        speakText('Command cancelled.');
      }
    } catch (err) {
      setPendingConfirmation(null);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setCurrentResponse(null);
      setPendingConfirmation(null);
      resetTranscript();
      setTextInput('');
      startListening();
    }
  };

  const quickPrompts = [
    'Add 20 bags of rice',
    'Remove 5 bags of rice',
    'Rice 20 bags add cheyyi',
    'How much rice do I have?',
    'What should I reorder?',
    'What is running low?',
    'How is my rice stock?',
    'What changed today?',
    'Remove 50 bags of rice'
  ];

  return (
    <GlassCard className={`relative overflow-hidden ${compact ? 'p-5' : 'p-6 sm:p-8'}`}>
      
      {/* Top Ambient Glow Highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-emerald-400/15 via-teal-300/10 to-transparent blur-2xl pointer-events-none -z-10" />

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/60 gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Voice Business Assistant</h2>
              <GlassBadge variant="ai" size="sm">Liquid AI</GlassBadge>
            </div>
            <p className="text-xs text-slate-500 font-medium">Real-time inventory and business control via natural voice</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {setLanguage && (
            <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md border border-white/90 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-700 shadow-sm">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={language || 'en-IN'}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-bold text-emerald-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
                <option value="te-IN">Telugu (తెలుగు)</option>
                <option value="hi-IN">Hindi (हिंदी)</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
              ttsEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' 
                : 'bg-white/60 border-white/80 text-slate-400'
            }`}
            title={ttsEnabled ? 'Voice reply enabled' : 'Voice reply muted'}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-bold">{ttsEnabled ? 'Voice On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Main Microphone Stage */}
      <VoiceButton 
        isListening={isListening}
        isProcessing={isProcessing}
        onClick={handleMicToggle}
        size={compact ? 'md' : 'hero'}
      />

      {/* Transcript & Input Card */}
      <TranscriptCard
        transcript={transcript}
        interimTranscript={interimTranscript}
        textInput={textInput}
        setTextInput={setTextInput}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isProcessing={isProcessing}
        error={voiceError}
        onSubmit={(cmd, src) => handleExecute(cmd, src, false)}
        onClear={() => {
          setTextInput('');
          resetTranscript();
          setCurrentResponse(null);
          setPendingConfirmation(null);
        }}
      />

      {/* Structured Command Understanding Card */}
      {(currentResponse?.parsed || pendingConfirmation?.parsed) && (
        <CommandUnderstandingCard
          parsed={currentResponse?.parsed || pendingConfirmation?.parsed}
          onTryAgain={handleMicToggle}
          onEdit={() => setIsEditing(true)}
          onUseText={() => {
            const el = document.getElementById('voice-text-input');
            if (el) el.focus();
            setIsEditing(true);
          }}
        />
      )}

      {/* SMART CONFIRMATION CARD */}
      {pendingConfirmation && (
        <ConfirmationCard
          commandId={pendingConfirmation.commandId}
          command={pendingConfirmation.command}
          currentStock={pendingConfirmation.currentStock}
          suggestedQuantity={pendingConfirmation.suggestedQuantity}
          isInsufficientStock={pendingConfirmation.isInsufficientStock}
          warning={pendingConfirmation.warning}
          confirmationReason={pendingConfirmation.confirmationReason}
          confidence={pendingConfirmation.parsed?.confidence}
          loading={confirmLoading}
          onConfirm={(cId, q) => handleConfirmPending(cId, q)}
          onCancel={() => handleCancelPending(pendingConfirmation.commandId)}
          onEdit={() => {
            setPendingConfirmation(null);
            setIsEditing(true);
          }}
        />
      )}

      {/* EXECUTION / BUSINESS INSIGHT RESPONSE CARD */}
      {currentResponse && !pendingConfirmation && (
        <VoiceResponseCard
          response={currentResponse}
          onDismiss={() => setCurrentResponse(null)}
          onCandidateSelect={(selectedCandidate) => {
            const newCmd = `${currentResponse.intent || 'Add'} ${selectedCandidate}`;
            setTextInput(newCmd);
            handleExecute(newCmd, 'TEXT', false);
          }}
          onReorderAction={async (reorderData) => {
            const reorderCmd = `Add ${reorderData.suggestedReorder} ${reorderData.unit} of ${reorderData.product}`;
            setTextInput(reorderCmd);
            handleExecute(reorderCmd, 'TEXT', false);
          }}
        />
      )}

      {/* Quick Prompts Chips */}
      <div className="mt-5 text-left">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
          Try saying or tapping:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTextInput(p);
                resetTranscript();
                handleExecute(p, 'TEXT', false);
              }}
              className="text-xs px-3.5 py-2 rounded-2xl bg-white/60 hover:bg-white border border-white/90 shadow-sm text-slate-700 font-semibold backdrop-blur-md active:scale-95 transition-all cursor-pointer"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>

      {/* Session History Log */}
      {!compact && sessionHistory.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/60">
          <VoiceHistory 
            history={sessionHistory} 
            onClear={() => setSessionHistory([])}
            onSelectCommand={(cmd) => {
              setTextInput(cmd);
              handleExecute(cmd, 'TEXT', false);
            }}
          />
        </div>
      )}

    </GlassCard>
  );
};

export default VoiceAssistant;
