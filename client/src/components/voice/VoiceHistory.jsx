import React from 'react';
import { History, Mic, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import GlassCard from '../glass/GlassCard';
import GlassBadge from '../glass/GlassBadge';

export const VoiceHistory = ({ history = [], onClear = null, onSelectCommand = null }) => {
  if (!history || history.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-xs text-slate-400">
        <History className="w-5 h-5 mx-auto mb-2 text-slate-300" />
        No voice interactions in this session yet.
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <span>Voice Action History</span>
        </h4>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {history.map((item, idx) => {
          const isAdd = item.intent === 'ADD' || item.response?.parsed?.action === 'ADD';
          const isRemove = item.intent === 'REMOVE' || item.response?.parsed?.action === 'REMOVE';
          const status = item.status || (item.response?.success ? 'SUCCESS' : 'FAILED');

          return (
            <div 
              key={item.id || idx}
              onClick={() => onSelectCommand && onSelectCommand(item.command || item.original_command)}
              className={`p-3 rounded-2xl flex items-center justify-between text-xs transition-all ${
                onSelectCommand ? 'hover:bg-white/90 hover:shadow-sm cursor-pointer active:scale-[0.99]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isAdd ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : isRemove ? 'bg-rose-50 text-rose-700 border border-rose-200/50' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isAdd ? <ArrowUpRight className="w-4 h-4" /> : isRemove ? <ArrowDownRight className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      "{item.command || item.original_command}"
                    </span>
                    <GlassBadge 
                      variant={status === 'SUCCESS' || status === 'CONFIRMED' ? 'success' : status === 'CANCELLED' ? 'neutral' : 'warning'} 
                      size="sm"
                    >
                      {item.intent || 'QUERY'}
                    </GlassBadge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.response?.message || item.product_name || 'Processed'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-medium block">
                  {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
                {item.confidence && (
                  <span className="text-[10px] font-semibold text-slate-500">
                    {Math.round(item.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default VoiceHistory;
