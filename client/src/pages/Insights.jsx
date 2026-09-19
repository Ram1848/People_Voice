import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { getInsights, addStock } from '../services/api.js';
import { StatCard, Badge, LoadingState, EmptyState } from '../components/common/index.js';
import { GlassCard, GlassButton, GlassBadge } from '../components/glass/index.js';

export const Insights = ({ onInventoryUpdated }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchInsightsData = async () => {
    try {
      setLoading(true);
      const res = await getInsights();
      if (res.success) {
        setInsights(res.data);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const handleQuickRestock = async (item) => {
    try {
      const res = await addStock({
        productId: item.id,
        productName: item.name,
        quantity: Math.max(5, item.minimumStock * 2),
        unit: item.unit,
        source: 'MANUAL',
      });
      if (res.success) {
        setActionSuccess(`Successfully replenished ${item.name}!`);
        fetchInsightsData();
        if (onInventoryUpdated) onInventoryUpdated();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Stock Insights & Velocity</h1>
            <GlassBadge variant="ai" size="sm">
              Live Analytics
            </GlassBadge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Real-time inventory intelligence derived from actual store transactions</p>
        </div>

        <GlassButton
          variant="secondary"
          size="md"
          onClick={fetchInsightsData}
          icon={RefreshCw}
        >
          Refresh Insights
        </GlassButton>
      </GlassCard>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && !insights ? (
        <LoadingState message="Analyzing inventory turnover and usage..." />
      ) : (
        <>
          {/* TODAY'S ACTIVITY HIGHLIGHT CARDS */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today's Store Activity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <StatCard
                title="Stock Added Today"
                value={`+${insights?.today?.additions?.units || 0}`}
                subtitle={`across ${insights?.today?.additions?.count || 0} intake transaction(s)`}
                icon={ArrowUpRight}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                valueColor="text-emerald-700"
              />

              <StatCard
                title="Dispatched / Sold Today"
                value={`-${insights?.today?.removals?.units || 0}`}
                subtitle={`across ${insights?.today?.removals?.count || 0} sale transaction(s)`}
                icon={ArrowDownRight}
                iconBg="bg-rose-50"
                iconColor="text-rose-600"
                valueColor="text-rose-600"
              />

              <StatCard
                title="Active Catalog Units"
                value={insights?.overview?.totalUnits ? Math.round(insights.overview.totalUnits).toLocaleString() : '0'}
                subtitle={`in ${insights?.overview?.totalProducts || 0} distinct products`}
                icon={Package}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />

            </div>
          </div>

          {/* TWO COLUMN GRID: FASTEST MOVING PRODUCTS & CRITICAL INVENTORY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Fastest Moving Items (High Recent Usage) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">High-Velocity Products (Past 7 Days)</h3>
                </div>
                <span className="text-xs font-bold text-slate-400">Actual Outflow</span>
              </div>

              <div className="space-y-3">
                {insights?.highUsageProducts && insights.highUsageProducts.length > 0 ? (
                  insights.highUsageProducts.map((prod) => (
                    <div 
                      key={prod.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 text-sm">{prod.name}</span>
                          <span className="text-xs text-slate-400 font-medium">({prod.unit})</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Current balance: <span className="font-semibold text-slate-700">{prod.currentStock} {prod.unit}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
                          {prod.totalSoldPast7Days} {prod.unit} sold
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">
                          {prod.salesTransactionsCount} dispatch(es)
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={TrendingUp}
                    title="No sales in the past 7 days"
                    description="When items are sold or dispatched, sales velocity metrics will appear here."
                  />
                )}
              </div>
            </div>

            {/* Critical Stock & Attention Required */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-slate-900 text-base">Products Needing Immediate Attention</h3>
                </div>
                <Badge variant={insights?.criticalItems?.length > 0 ? 'warning' : 'neutral'} size="sm">
                  {insights?.criticalItems?.length || 0} Items
                </Badge>
              </div>

              <div className="space-y-3">
                {insights?.criticalItems && insights.criticalItems.length > 0 ? (
                  insights.criticalItems.map((item) => {
                    return (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900 text-sm">{item.name}</span>
                            <Badge variant={item.status} size="sm">
                              {item.status?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Stock: <span className="font-bold text-slate-800">{item.currentStock} {item.unit}</span> (Min: {item.minimumStock} {item.unit})
                          </p>
                        </div>

                        <button
                          onClick={() => handleQuickRestock(item)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          Restock
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    icon={CheckCircle2}
                    title="All products are well stocked"
                    description="No items are currently below minimum thresholds."
                  />
                )}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default Insights;
