import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  Info, 
  Sparkles 
} from 'lucide-react';
import GlassCard from '../glass/GlassCard';
import GlassBadge from '../glass/GlassBadge';
import GlassButton from '../glass/GlassButton';

export const StockExplanationCard = ({ data, onReorderClick }) => {
  if (!data) return null;

  const isOutOfStock = data.status === 'OUT_OF_STOCK' || data.currentStock === 0;
  const isLowStock = data.status === 'LOW_STOCK';

  return (
    <GlassCard className="p-6 my-4 text-left">
      
      {/* Card Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-emerald-500/20">
            {data.product?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="font-extrabold text-lg text-slate-900 capitalize">
                {data.product}
              </h3>
              <GlassBadge 
                variant={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'} 
                size="sm"
                dot
              >
                {data.status}
              </GlassBadge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Automated Stock Intelligence & Sales Velocity Analysis
            </p>
          </div>
        </div>

        <GlassBadge variant="ai" size="sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>AI Insight</span>
        </GlassBadge>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        
        {/* Current Stock */}
        <div className="bg-white/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Current Stock
          </span>
          <span className={`text-xl font-black ${
            isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'
          }`}>
            {data.currentStock} {data.unit}
          </span>
        </div>

        {/* Minimum Threshold */}
        <div className="bg-white/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Minimum Stock
          </span>
          <span className="text-xl font-black text-slate-700">
            {data.minimumStock} {data.unit}
          </span>
        </div>

        {/* Average Usage */}
        <div className="bg-white/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Average Usage
          </span>
          <span className="text-sm font-extrabold text-slate-800 block mt-1">
            {data.hasUsageHistory && data.averageDailyUsage
              ? `${data.averageDailyUsage} ${data.unit}/day`
              : <span className="text-xs text-slate-400 font-normal">Insufficient history</span>}
          </span>
        </div>

        {/* Suggested Reorder */}
        <div className="bg-emerald-500/10 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/20 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
            Suggested Reorder
          </span>
          <span className="text-xl font-black text-emerald-800">
            {data.suggestedReorder > 0 ? `+${data.suggestedReorder} ${data.unit}` : 'None needed'}
          </span>
        </div>

      </div>

      {/* Plain Language Explanation */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 text-xs text-slate-700 flex items-start space-x-3 shadow-sm">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="font-medium leading-relaxed">
          {data.explanation}
        </p>
      </div>

      {/* Action footer if reorder recommended */}
      {data.suggestedReorder > 0 && onReorderClick && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-medium">
            Rule: (Avg Usage × 3-day lead time) + Min Stock - Current
          </span>
          <GlassButton
            size="sm"
            onClick={() => onReorderClick(data)}
            icon={ShoppingCart}
          >
            Reorder {data.suggestedReorder} {data.unit}
          </GlassButton>
        </div>
      )}

    </GlassCard>
  );
};

export default StockExplanationCard;
