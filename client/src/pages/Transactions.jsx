import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Mic, 
  Keyboard, 
  Sliders, 
  RefreshCw, 
  Search, 
  History
} from 'lucide-react';
import { getHistory } from '../services/api.js';
import { Badge, LoadingState, EmptyState } from '../components/common/index.js';
import { GlassCard, GlassInput, GlassButton, GlassBadge } from '../components/glass/index.js';

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getHistory(100);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (actionFilter !== 'ALL' && t.action !== actionFilter) return false;
    if (sourceFilter !== 'ALL' && t.source !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.product?.toLowerCase().includes(q) ||
        t.originalCommand?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transaction History & Audit Trail</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Full audit trail of all voice, text, and manual inventory operations</p>
        </div>

        <GlassButton
          variant="secondary"
          size="md"
          onClick={fetchTransactions}
          icon={RefreshCw}
        >
          Refresh History
        </GlassButton>
      </GlassCard>

      {/* Filters Toolbar Glass Card */}
      <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <GlassInput
            icon={Search}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product or spoken command..."
          />
        </div>

        {/* Action and Source Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Action Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">Action:</span>
            {['ALL', 'ADD', 'REMOVE'].map((act) => (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none ${
                  actionFilter === act
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white/60 hover:bg-white text-slate-600 border border-white/80'
                }`}
              >
                {act}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          <div className="flex items-center space-x-1.5 border-l pl-3 border-white/80">
            <span className="text-xs font-bold text-slate-400 mr-1">Source:</span>
            {['ALL', 'VOICE', 'TEXT', 'MANUAL'].map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none ${
                  sourceFilter === src
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                    : 'bg-white/60 hover:bg-white text-slate-600 border border-white/80'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>

      </GlassCard>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && transactions.length === 0 ? (
          <LoadingState message="Loading transaction audit log..." />
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon={History}
            title="No transactions found"
            description={searchQuery ? `No activity matching "${searchQuery}"` : 'No transactions recorded matching the selected filter.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Time</th>
                  <th className="px-6 py-3.5">Original Command</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Stock Shift</th>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isAdd = tx.action === 'ADD';
                  const confPct = Math.round((tx.confidence || 0.95) * 100);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <div className="text-slate-800 font-bold">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate text-xs" title={tx.originalCommand}>
                        {tx.originalCommand ? `"${tx.originalCommand}"` : '—'}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">
                        {tx.product}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={tx.action} size="sm">
                          {isAdd ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{tx.action}</span>
                        </Badge>
                      </td>

                      <td className="px-6 py-4 font-extrabold text-sm whitespace-nowrap">
                        <span className={isAdd ? 'text-emerald-700' : 'text-rose-700'}>
                          {isAdd ? '+' : '-'}{tx.quantity} {tx.unit}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                        <span className="text-slate-400">{tx.previousStock}</span>
                        <span className="mx-1 text-slate-300">→</span>
                        <span className="text-slate-900 font-bold">{tx.updatedStock} {tx.unit}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                          tx.source === 'VOICE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.source === 'TEXT'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {tx.source === 'VOICE' && <Mic className="w-3 h-3 text-emerald-600" />}
                          {tx.source === 'TEXT' && <Keyboard className="w-3 h-3 text-blue-600" />}
                          {tx.source === 'MANUAL' && <Sliders className="w-3 h-3 text-slate-600" />}
                          <span>{tx.source}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={confPct >= 85 ? 'HIGH' : 'MEDIUM'} size="sm">
                          {confPct >= 85 ? 'High' : 'Medium'} ({confPct}%)
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Transactions;
