import React from 'react';
import { Sparkles, RefreshCw, Edit3, Keyboard } from 'lucide-react';
import ConfidenceIndicator from './ConfidenceIndicator';
import GlassCard from '../glass/GlassCard';
import GlassButton from '../glass/GlassButton';

export const CommandUnderstandingCard = ({
  parsed,
  onTryAgain,
  onEdit,
  onUseText,
}) => {
  if (!parsed) return null;

  const isAdd = parsed.action === 'ADD';
  const isRemove = parsed.action === 'REMOVE';
  const isCheck = parsed.action === 'CHECK';

  return (
    <GlassCard className="p-5 text-left my-3 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Command Understanding
            </h4>
            <span className="text-xs font-extrabold text-slate-900">
              Structured Intent Recognized:
            </span>
          </div>
        </div>

        <ConfidenceIndicator 
          confidence={parsed.confidence} 
          level={parsed.confidenceLevel} 
        />
      </div>

      {/* Structured Intent & Entity Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Action</span>
          <span className={`text-base font-black ${
            isAdd ? 'text-emerald-600' : isRemove ? 'text-rose-600' : 'text-slate-800'
          }`}>
            {parsed.action || 'QUERY'}
          </span>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Product</span>
          <span className="text-base font-extrabold text-slate-900 capitalize">
            {parsed.product || '—'}
          </span>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Quantity</span>
          <span className="text-base font-extrabold text-slate-900">
            {parsed.quantity !== null && parsed.quantity !== undefined ? parsed.quantity : '—'}
          </span>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Unit</span>
          <span className="text-base font-extrabold text-slate-900 capitalize">
            {parsed.unit || '—'}
          </span>
        </div>
      </div>

      {/* Quick Action Toolbar: Try Again / Edit / Use Text */}
      <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100/80 text-xs">
        {onTryAgain && (
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={onTryAgain}
            icon={RefreshCw}
          >
            Try Again
          </GlassButton>
        )}
        {onEdit && (
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={onEdit}
            icon={Edit3}
          >
            Edit
          </GlassButton>
        )}
        {onUseText && (
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={onUseText}
            icon={Keyboard}
          >
            Use Text
          </GlassButton>
        )}
      </div>
    </GlassCard>
  );
};

export default CommandUnderstandingCard;
