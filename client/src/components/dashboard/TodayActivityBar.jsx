import React from 'react';
import { Clock } from 'lucide-react';

export const TodayActivityBar = ({ todayData }) => {
  if (!todayData) return null;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm">Today's Activity</h3>
            <p className="text-xs text-slate-400">Live store activity summary for today</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Added Today</span>
            <span className="text-emerald-400 font-extrabold text-sm">
              +{todayData.additions?.units || 0} units ({todayData.additions?.count || 0} intake)
            </span>
          </div>
          <div className="border-l border-slate-700 pl-6">
            <span className="text-slate-400 block font-medium">Sold Today</span>
            <span className="text-rose-400 font-extrabold text-sm">
              -{todayData.removals?.units || 0} units ({todayData.removals?.count || 0} sale)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayActivityBar;
