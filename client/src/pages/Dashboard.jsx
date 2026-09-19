import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Boxes, 
  AlertTriangle, 
  AlertOctagon, 
  RefreshCw,
  Sparkles,
  Mic,
  CheckCircle2
} from 'lucide-react';
import { getDashboard, getInsights, addStock } from '../services/api.js';
import VoiceAssistant from '../components/voice/VoiceAssistant.jsx';
import GlassStat from '../components/glass/GlassStat.jsx';
import GlassCard from '../components/glass/GlassCard.jsx';
import GlassButton from '../components/glass/GlassButton';
import { TodayActivityBar, RecentActivityCard, ReorderSuggestionsCard } from '../components/dashboard/index.js';

export const Dashboard = ({ voiceRecognition, setActiveTab }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashRes, insRes] = await Promise.all([
        getDashboard(),
        getInsights().catch(() => ({ success: false, data: null }))
      ]);

      if (dashRes.success) {
        setDashboardData(dashRes.data);
      }
      if (insRes?.success) {
        setInsightsData(insRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleQuickReorder = async (item) => {
    try {
      const res = await addStock({
        productId: item.id,
        productName: item.name,
        quantity: item.recommendedQuantity,
        unit: item.unit,
        source: 'MANUAL',
      });
      if (res.success) {
        setActionSuccess(`Reordered ${item.recommendedQuantity} ${item.unit} of ${item.name}!`);
        fetchAllData();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Apple-style Hero Top Welcome Bar */}
      <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Good morning 👋
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Live Store
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Voice-powered intelligent inventory control for your business.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <GlassButton
            onClick={() => setActiveTab('voice')}
            icon={Mic}
            size="md"
          >
            Start Voice Command
          </GlassButton>
          
          <GlassButton
            variant="secondary"
            size="md"
            onClick={fetchAllData}
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </GlassButton>
        </div>
      </GlassCard>

      {actionSuccess && (
        <div className="bg-emerald-50/80 backdrop-blur-xl border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center space-x-2.5 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 4 Apple-inspired Glass Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStat
          label="Total Products"
          value={dashboardData ? dashboardData.totalProducts : '...'}
          subtitle="Catalog active items"
          icon={Package}
          variant="default"
          onClick={() => setActiveTab('products')}
        />

        <GlassStat
          label="Total Stock"
          value={dashboardData ? Math.round(dashboardData.totalStockQuantity).toLocaleString() : '...'}
          subtitle="Units across all inventory"
          icon={Boxes}
          variant="emerald"
          onClick={() => setActiveTab('inventory')}
        />

        <GlassStat
          label="Low Stock"
          value={dashboardData ? dashboardData.lowStockCount : '...'}
          subtitle="Below safety threshold"
          icon={AlertTriangle}
          variant="amber"
          trend={dashboardData?.lowStockCount > 0 ? 'Needs Attention' : 'Healthy'}
          trendPositive={dashboardData?.lowStockCount === 0}
          onClick={() => setActiveTab('alerts')}
        />

        <GlassStat
          label="Out of Stock"
          value={dashboardData ? dashboardData.outOfStockCount : '...'}
          subtitle="Zero units balance"
          icon={AlertOctagon}
          variant="rose"
          trend={dashboardData?.outOfStockCount > 0 ? 'Replenish Now' : 'Zero items'}
          trendPositive={dashboardData?.outOfStockCount === 0}
          onClick={() => setActiveTab('alerts')}
        />
      </div>

      {/* Main Liquid Voice Assistant in Hero Position */}
      <VoiceAssistant
        voiceRecognition={voiceRecognition}
        onInventoryUpdated={fetchAllData}
        compact={false}
      />

      {/* TODAY'S ACTIVITY BAR */}
      <TodayActivityBar todayData={insightsData?.today} />

      {/* Two Column Grid: Low Stock & Smart Reorders vs Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReorderSuggestionsCard
          recommendations={dashboardData?.reorderSuggestions}
          onReorderClick={handleQuickReorder}
        />

        <RecentActivityCard
          recentTransactions={dashboardData?.recentTransactions}
          onFullLogClick={() => setActiveTab('transactions')}
        />
      </div>

    </div>
  );
};

export default Dashboard;
