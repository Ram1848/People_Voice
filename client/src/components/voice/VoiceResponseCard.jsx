import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ShoppingCart, 
  ArrowRight,
  X 
} from 'lucide-react';
import StockExplanationCard from './StockExplanationCard';
import GlassCard from '../glass/GlassCard';
import GlassBadge from '../glass/GlassBadge';
import GlassButton from '../glass/GlassButton';

export const VoiceResponseCard = ({
  response,
  onDismiss,
  onCandidateSelect,
  onReorderAction,
}) => {
  if (!response) return null;

  // 1. Stock Explanation Response
  if (response.type === 'STOCK_EXPLANATION' && response.data) {
    return (
      <div className="relative animate-in zoom-in-95 duration-200">
        <StockExplanationCard 
          data={response.data} 
          onReorderClick={onReorderAction} 
        />
      </div>
    );
  }

  // 2. Ambiguity Clarification Response ("Which product do you mean?")
  if (response.isAmbiguous && response.candidates && response.candidates.length > 0) {
    return (
      <div className="bg-amber-50/85 backdrop-blur-2xl border border-amber-200/80 rounded-3xl p-5 my-3 text-left animate-in zoom-in-95 duration-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span>Product Clarification Needed</span>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-amber-900/90 mt-2 font-medium">
          {response.message || 'Multiple matching products found in catalog. Which product do you mean?'}
        </p>
        <div className="flex flex-wrap gap-2 mt-3.5">
          {response.candidates.map((cand, idx) => (
            <button
              key={idx}
              onClick={() => onCandidateSelect && onCandidateSelect(cand)}
              className="px-3.5 py-2 bg-white/90 hover:bg-white border border-amber-300 text-amber-950 font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{cand}</span>
              <ArrowRight className="w-3 h-3 text-amber-600" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Smart Reorder Suggestions List
  if (response.type === 'REORDER_SUGGESTIONS' && response.data?.suggestions) {
    const { suggestions, summary } = response.data;
    return (
      <GlassCard className="p-6 my-3 text-left animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Today's Purchase Suggestions</h4>
              <p className="text-xs text-slate-500 font-medium">Derived from current stock & daily sales velocity</p>
            </div>
          </div>
          <GlassBadge variant="warning" size="sm">
            {suggestions.length} Items to Reorder
          </GlassBadge>
        </div>

        <div className="space-y-2.5">
          {suggestions.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-sm text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                <span className="block text-slate-500 text-[11px] mt-0.5">
                  Current: <strong className="text-rose-600">{item.currentStock} {item.unit}</strong> • Min: {item.minimumStock} {item.unit} • Avg: {item.averageDailyUsage} {item.unit}/day
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 italic">{item.reason}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-emerald-700 bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-200 shadow-sm inline-block">
                  +{item.recommendedOrder} {item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  // 4. Standard Response Card (Executed or Error)
  const isSuccess = response.success;
  return (
    <div className={`p-5 rounded-3xl border my-3 text-left backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all animate-in zoom-in-95 duration-200 ${
      isSuccess 
        ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950' 
        : 'bg-rose-50/80 border-rose-200/80 text-rose-950'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <GlassBadge variant={isSuccess ? 'success' : 'danger'} size="sm">
                {isSuccess ? 'COMPLETED' : 'NOTICE'}
              </GlassBadge>
              {response.parsed?.confidence && (
                <span className="text-[10px] font-bold text-slate-500">
                  {Math.round(response.parsed.confidence * 100)}% Confidence
                </span>
              )}
            </div>
            <p className="text-sm font-bold mt-1.5 leading-relaxed text-slate-900">
              {response.message}
            </p>

            {response.data?.currentStock !== undefined && (
              <p className="text-xs font-bold text-slate-700 mt-1">
                Updated Balance in Database: <span className="text-emerald-700 font-extrabold">{response.data.currentStock} {response.data.unit}</span>
              </p>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-white/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceResponseCard;
