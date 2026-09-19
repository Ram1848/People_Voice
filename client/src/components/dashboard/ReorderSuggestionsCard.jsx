import React from 'react';
import { ShoppingCart } from 'lucide-react';
import GlassCard from '../glass/GlassCard';
import GlassBadge from '../glass/GlassBadge';
import GlassButton from '../glass/GlassButton';

export const ReorderSuggestionsCard = ({ recommendations, onReorderClick }) => {
  return (
    <GlassCard className="p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
              Smart Reorder Suggestions
            </h3>
          </div>
          <GlassBadge variant="warning" size="sm">
            {recommendations?.length || 0} Alerts
          </GlassBadge>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <div className="space-y-2.5">
            {recommendations.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white/80 transition-all text-xs shadow-sm"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <GlassBadge 
                      variant={item.status === 'OUT_OF_STOCK' ? 'danger' : 'warning'} 
                      size="sm"
                    >
                      {item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'}
                    </GlassBadge>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {item.currentStock} {item.unit} remaining • Min: {item.minimumStock} {item.unit}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
                    +{item.recommendedQuantity} {item.unit}
                  </span>
                  <GlassButton
                    size="sm"
                    onClick={() => onReorderClick(item)}
                  >
                    Order
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs">
            ✓ All products are at safe stock levels!
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ReorderSuggestionsCard;
