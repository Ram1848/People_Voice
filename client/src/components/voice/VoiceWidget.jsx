import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles
} from 'lucide-react';
import { sendVoiceCommand, addStock } from '../../services/api.js';
import ConfirmationModal from './ConfirmationModal.jsx';
import StockExplanationCard from './StockExplanationCard.jsx';
import Badge from '../common/Badge.jsx';

export const VoiceWidget = ({ 
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
    speakText
  } = voiceRecognition;

  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUnderstood, setPendingUnderstood] = useState(null);
  const [pendingCommand, setPendingCommand] = useState('');
  const [confirmationReason, setConfirmationReason] = useState('');

  // Auto-submit after voice finishes listening
  useEffect(() => {
    if (transcript) {
      setTextInput(transcript);
      handleExecuteCommand(transcript, 'VOICE', false);
    }
  }, [transcript]);

  const handleExecuteCommand = async (cmdToExecute, source = 'TEXT', confirmed = false) => {
    const finalCmd = (cmdToExecute || textInput).trim();
    if (!finalCmd) return;

    setIsProcessing(true);
    if (!confirmed) {
      setLastResult(null);
    }

    try {
      const response = await sendVoiceCommand(finalCmd, source, confirmed);
      
      // If backend asks for confirmation before updating
      if (response.requiresConfirmation && !confirmed) {
        setPendingUnderstood(response.understood);
        setPendingCommand(finalCmd);
        setConfirmationReason(response.confirmationReason);
        setShowConfirmModal(true);

        if (ttsEnabled && response.spokenMessage) {
          speakText(response.spokenMessage);
        }
        return;
      }

      // Successful direct execution or business query response
      setLastResult(response);
      setShowConfirmModal(false);

      if (ttsEnabled && response.spokenMessage) {
        speakText(response.spokenMessage);
      }

      if (onInventoryUpdated) {
        onInventoryUpdated(response);
      }
    } catch (err) {
      const errorData = err.response?.data || {
        success: false,
        message: err.message || 'Error processing command. Please try again.',
        spokenMessage: 'Could not complete command. Please check your input.',
      };
      setLastResult(errorData);
      setShowConfirmModal(false);

      if (ttsEnabled && errorData.spokenMessage) {
        speakText(errorData.spokenMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = () => {
    setShowConfirmModal(false);
    handleExecuteCommand(pendingCommand, 'VOICE', true);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setLastResult(null);
      resetTranscript();
      setTextInput('');
      startListening();
    }
  };

  const handleSuggestionClick = (example) => {
    setTextInput(example);
    resetTranscript();
    handleExecuteCommand(example, 'TEXT', false);
  };

  // State calculation for clear visual indicator
  let currentState = 'READY';
  if (isListening) currentState = 'LISTENING';
  else if (isProcessing) currentState = 'PROCESSING';
  else if (showConfirmModal) currentState = 'CONFIRMATION';
  else if (lastResult?.success) currentState = 'SUCCESS';
  else if (lastResult && !lastResult.success) currentState = 'ERROR';

  const quickExamples = [
    'Add 20 bags of rice',
    'How is my rice stock?',
    'What should I reorder?',
    'What changed today?',
    'Rice 20 bags add cheyyi',
    'Remove 50 bags of rice'
  ];

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm transition-all overflow-hidden ${
      compact ? 'p-5' : 'p-6 sm:p-8'
    }`}>
      
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Voice Business Assistant</h2>
            <p className="text-xs text-slate-500 font-medium">Manage stock and query store intelligence using natural speech</p>
          </div>
        </div>

        {/* State Badge & TTS Toggle */}
        <div className="flex items-center space-x-2">
          {/* Assistant State Pill */}
          <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {currentState === 'LISTENING' && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
            {currentState === 'PROCESSING' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
            {currentState === 'SUCCESS' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            {currentState === 'ERROR' && <span className="w-2 h-2 rounded-full bg-rose-500" />}
            {currentState === 'READY' && <span className="w-2 h-2 rounded-full bg-slate-400" />}
            <span>{currentState}</span>
          </div>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              ttsEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
            }`}
            title={ttsEnabled ? 'Spoken voice reply active' : 'Voice reply muted'}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{ttsEnabled ? 'Voice Reply On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Main Microphone Stage */}
      <div className="flex flex-col items-center justify-center py-3 text-center">
        
        {/* Pulsing Mic Button */}
        <div className="relative flex items-center justify-center mb-4">
          {isListening && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-red-400/20 animate-ping" />
              <div className="absolute w-24 h-24 rounded-full bg-red-500/20 animate-pulse" />
            </>
          )}

          <button
            onClick={handleToggleListening}
            disabled={isProcessing}
            className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center shadow-md transition-all transform active:scale-95 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 ring-4 ring-red-100 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:shadow-lg'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-7 h-7 sm:w-8 sm:h-8" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Speak</span>
              </>
            )}
          </button>
        </div>

        {/* Live Hearing Transcript */}
        <div className="min-h-[28px] mb-2">
          {isListening ? (
            <p className="text-sm font-bold text-red-600 flex items-center justify-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Listening... Speak now</span>
            </p>
          ) : isProcessing ? (
            <p className="text-sm font-bold text-blue-600 flex items-center justify-center space-x-1.5">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Understanding your request...</span>
            </p>
          ) : (
            <p className="text-xs font-semibold text-slate-500">
              Tap the microphone to speak, or use the command input below
            </p>
          )}
        </div>

        {interimTranscript && (
          <div className="w-full max-w-md bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 my-1 text-xs text-emerald-900 font-medium">
            <span className="font-bold">Hearing: </span>
            <span>"{interimTranscript}"</span>
          </div>
        )}

        {voiceError && (
          <div className="w-full max-w-lg bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 my-2 text-xs flex items-start space-x-2 text-left">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{voiceError}</p>
              <p className="text-amber-700 mt-0.5">You can always use the text command box below.</p>
            </div>
          </div>
        )}
      </div>

      {/* Recognized Speech / Text Fallback Input */}
      <div className="mt-2 mb-5">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteCommand(textInput, 'TEXT', false);
          }}
          className="relative flex items-center"
        >
          <input
            id="voice-text-input"
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder='Ask or instruct: "Add 20 bags of rice", "How is my rice stock?", "What changed today?"'
            className="w-full pl-4 pr-24 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
          />
          
          <div className="absolute right-1.5 flex items-center space-x-1">
            {textInput && (
              <button
                type="button"
                onClick={() => {
                  setTextInput('');
                  resetTranscript();
                  setLastResult(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 text-xs rounded-lg"
              >
                ✕
              </button>
            )}

            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing}
              className="inline-flex items-center space-x-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <span>Run</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      {/* INLINE STOCK EXPLANATION CARD (When user asks: "How is my rice stock?") */}
      {lastResult?.type === 'STOCK_EXPLANATION' && lastResult.data && (
        <StockExplanationCard 
          data={lastResult.data} 
          onReorderClick={async (stockData) => {
            try {
              const res = await addStock({
                productName: stockData.product,
                quantity: stockData.suggestedReorder,
                unit: stockData.unit,
                source: 'VOICE',
              });
              if (res.success) {
                setLastResult({
                  success: true,
                  message: `Reordered ${stockData.suggestedReorder} ${stockData.unit} of ${stockData.product} successfully!`,
                  spokenMessage: `${stockData.suggestedReorder} ${stockData.unit} of ${stockData.product} added to stock.`,
                });
                if (onInventoryUpdated) onInventoryUpdated();
              }
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}

      {/* EXECUTION RESULT & CONFIDENCE BADGE CARD */}
      {lastResult && lastResult.type !== 'STOCK_EXPLANATION' && (
        <div className={`p-4 rounded-2xl border mb-5 transition-all ${
          lastResult.success
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-rose-50/70 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {lastResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-sm">
                    {lastResult.success ? 'Command Executed' : 'Notice'}
                  </h4>
                  {lastResult.parsed?.confidence && (
                    <Badge variant={lastResult.parsed.confidenceLevel || 'HIGH'} size="sm">
                      {Math.round(lastResult.parsed.confidence * 100)}% Confidence
                    </Badge>
                  )}
                </div>
                <p className="text-sm mt-0.5 font-medium">{lastResult.message}</p>
                
                {lastResult.data?.currentStock !== undefined && (
                  <p className="text-xs font-bold text-slate-700 mt-1">
                    Updated Database Balance: {lastResult.data.currentStock} {lastResult.data.unit}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                resetTranscript();
                setTextInput('');
                setLastResult(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>

          {/* Understood Card Breakdown */}
          {lastResult.parsed && (lastResult.parsed.action === 'ADD' || lastResult.parsed.action === 'REMOVE') && (
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Command Interpretation:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Action</span>
                  <span className={`font-black ${lastResult.parsed.action === 'ADD' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {lastResult.parsed.action}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Product</span>
                  <span className="font-bold text-slate-800 capitalize">{lastResult.parsed.product}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Quantity</span>
                  <span className="font-bold text-slate-800">{lastResult.parsed.quantity} {lastResult.parsed.unit}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence</span>
                  <Badge variant={lastResult.parsed.confidenceLevel || 'HIGH'} size="sm">
                    {lastResult.parsed.confidenceLevel || 'HIGH'}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons: Try Again / Edit / Use Text */}
              <div className="flex items-center space-x-2 mt-3 text-xs">
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('voice-text-input');
                    if (el) el.focus();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Edit / Use Text
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested Voice Commands Chips */}
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Try saying or clicking:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickExamples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(example)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold border border-transparent transition-all"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* SMART CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        understood={pendingUnderstood}
        confirmationReason={confirmationReason}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        onEdit={() => {
          setShowConfirmModal(false);
          setTextInput(pendingCommand);
        }}
      />

    </div>
  );
};

export default VoiceWidget;
