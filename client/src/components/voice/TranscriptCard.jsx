import React from 'react';
import { Edit2, Send, X, Mic } from 'lucide-react';
import GlassButton from '../glass/GlassButton';

export const TranscriptCard = ({
  transcript,
  interimTranscript,
  textInput,
  setTextInput,
  isEditing,
  setIsEditing,
  onSubmit,
  onClear,
  isProcessing = false,
  error = null,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto my-3 space-y-2.5">
      {/* Live Interim Speech Bubble */}
      {interimTranscript && (
        <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 text-emerald-900 rounded-2xl p-3.5 text-xs font-medium animate-in fade-in duration-200 flex items-center gap-2.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span className="font-bold text-emerald-800">Hearing:</span>
          <span className="italic text-slate-800">"{interimTranscript}"</span>
        </div>
      )}

      {/* Spoken Transcript Glass Card */}
      <div className="bg-white/65 backdrop-blur-xl border border-white/90 rounded-2xl p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.95)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            You said:
          </span>
          {textInput && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditing ? 'Done' : 'Edit'}</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(textInput, 'TEXT');
            }} 
            className="flex items-center gap-2 mt-1"
          >
            <input
              type="text"
              autoFocus
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder='e.g. "Add 20 bags of rice"'
              className="w-full px-4 py-2.5 bg-white/80 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <GlassButton
              type="submit"
              size="sm"
              disabled={!textInput.trim() || isProcessing}
            >
              Run
            </GlassButton>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-800 min-h-[24px]">
              {textInput ? (
                `"${textInput}"`
              ) : (
                <span className="text-slate-400 font-normal italic">
                  Waiting for voice input or enter a command below...
                </span>
              )}
            </p>
            {textInput && (
              <button
                type="button"
                onClick={onClear}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Voice Error Notice if any */}
      {error && (
        <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-amber-900 rounded-2xl p-3.5 text-xs flex items-start gap-2 text-left animate-in fade-in">
          <span className="font-bold text-amber-800">Notice:</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default TranscriptCard;
