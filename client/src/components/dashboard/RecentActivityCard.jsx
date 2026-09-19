import React from 'react';
import { Clock, ArrowUpRight, ArrowDownRight, Mic, Keyboard, Sliders } from 'lucide-react';
import GlassCard from '../glass/GlassCard';
import GlassBadge from '../glass/GlassBadge';

export const RecentActivityCard = ({ recentTransactions, onFullLogClick }) => {
  return (
    <GlassCard className="p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
              Recent Voice & Store Activity
            </h3>
          </div>
          {onFullLogClick && (
            <button
              onClick={onFullLogClick}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>Full Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="space-y-2.5">
            {recentTransactions.map((tx) => {
              const isAdd = tx.action === 'ADD';
              return (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 text-xs shadow-sm hover:bg-white/80 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isAdd ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                    }`}>
                      {isAdd ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{tx.product}</span>
                        <GlassBadge variant={isAdd ? 'success' : 'danger'} size="sm">
                          {tx.action}
                        </GlassBadge>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {tx.previousStock} → {tx.updatedStock} {tx.unit}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-black ${isAdd ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isAdd ? '+' : '-'}{tx.quantity} {tx.unit}
                    </span>
                    <div className="flex items-center justify-end space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                      {tx.source === 'VOICE' && <Mic className="w-3 h-3 text-emerald-600" />}
                      {tx.source === 'TEXT' && <Keyboard className="w-3 h-3 text-blue-500" />}
                      {tx.source === 'MANUAL' && <Sliders className="w-3 h-3 text-slate-400" />}
                      <span className="font-medium">{tx.source}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs">
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default RecentActivityCard;
