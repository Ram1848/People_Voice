import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  ShoppingCart, 
  CheckCircle2, 
  RefreshCw, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { getRecommendations, addStock } from '../services/api.js';
import { Badge, LoadingState, EmptyState } from '../components/common/index.js';
import { GlassCard, GlassButton, GlassBadge } from '../components/glass/index.js';

export const Alerts = ({ onInventoryUpdated }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [orderingId, setOrderingId] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await getRecommendations();
      if (res.success) {
        setRecommendations(res.data);
      }
    } catch (err) {
      console.error('Failed to load reorder recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleQuickReorder = async (item) => {
    setOrderingId(item.productId);
    try {
      const res = await addStock({
        productId: item.productId,
        productName: item.productName,
        quantity: item.recommendedQuantity,
        unit: item.unit,
        source: 'MANUAL',
      });
      if (res.success) {
        setActionSuccess(`Successfully added ${item.recommendedQuantity} ${item.unit} to ${item.productName}!`);
        fetchRecommendations();
        if (onInventoryUpdated) onInventoryUpdated();
        setTimeout(() => setActionSuccess(null), 4500);
      }
    } catch (err) {
      console.error('Reorder error:', err);
    } finally {
      setOrderingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Low Stock & Reorder Suggestions</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Automated alerts for items at or below your safety threshold</p>
        </div>

        <GlassButton
          variant="secondary"
          size="md"
          onClick={fetchRecommendations}
          icon={RefreshCw}
        >
          Refresh Alerts
        </GlassButton>
      </GlassCard>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Reorder Formula Info Banner */}
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparent Reorder Suggestion Logic:</span>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            For items below safety thresholds, the system calculates: <code className="font-mono bg-blue-100/70 px-1.5 py-0.5 rounded font-bold text-blue-900">(Avg Daily Usage × 3-day lead time) + Min Stock - Current Stock</code>.
            When usage history is new, fallback is: <code className="font-mono bg-blue-100/70 px-1.5 py-0.5 rounded font-bold text-blue-900">(Min Stock × 2) - Current Stock</code>.
          </p>
        </div>
      </div>

      {/* Cards of products needing reorder */}
      {loading && recommendations.length === 0 ? (
        <LoadingState message="Checking inventory thresholds..." />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="All Stock Levels are Healthy!"
          description="None of your items are currently below their minimum thresholds. Everything is safely stocked."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((item) => {
            const isCritical = item.urgency === 'CRITICAL';
            return (
              <div 
                key={item.productId}
                className={`rounded-2xl border p-6 transition-all bg-white shadow-sm flex flex-col justify-between ${
                  isCritical ? 'border-rose-200 hover:border-rose-300' : 'border-amber-200 hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-lg text-slate-900">{item.productName}</h3>
                        <Badge variant={isCritical ? 'danger' : 'warning'} size="sm">
                          {item.urgency} ALERT
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
                    </div>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCritical ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {isCritical ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Stock Metrics breakdown */}
                  <div className="grid grid-cols-3 gap-2 my-4 pt-4 border-t border-slate-100">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stock</span>
                      <span className={`text-base font-extrabold ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Min Threshold</span>
                      <span className="text-base font-extrabold text-slate-700">
                        {item.minimumStock} {item.unit}
                      </span>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-xl text-center border border-emerald-200/80">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">Suggested Reorder</span>
                      <span className="text-base font-extrabold text-emerald-800">
                        +{item.recommendedQuantity} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleQuickReorder(item)}
                    disabled={orderingId === item.productId}
                    className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      {orderingId === item.productId 
                        ? 'Updating Stock...' 
                        : `One-Click Restock (+${item.recommendedQuantity} ${item.unit})`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Alerts;
