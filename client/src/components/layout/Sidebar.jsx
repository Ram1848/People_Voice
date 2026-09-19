import React from 'react';
import { 
  LayoutDashboard, 
  Mic, 
  Package, 
  History, 
  FolderKanban, 
  TrendingUp, 
  AlertTriangle, 
  Store, 
  Globe, 
  X,
  Sparkles
} from 'lucide-react';
import GlassBadge from '../glass/GlassBadge';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  language, 
  setLanguage, 
  isOpen, 
  setIsOpen 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'voice', label: 'Voice Assistant', icon: Mic, isVoice: true },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'products', label: 'Products', icon: FolderKanban },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts & Reorder', icon: AlertTriangle },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop with Blur */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/25 z-40 lg:hidden backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Floating Glass Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:m-4 lg:h-[calc(100vh-2rem)] lg:rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] flex flex-col justify-between transition-all duration-300 ease-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top: Brand Header & Navigation */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/60">
            <div 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">People Voice</span>
                  <GlassBadge variant="ai" size="sm">AI</GlassBadge>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Liquid Voice Assistant</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-white/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3.5 space-y-1.5 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all select-none ${
                    isActive
                      ? item.isVoice
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                        : 'bg-white/90 text-slate-900 font-bold shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-white'
                      : item.isVoice
                        ? 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <Icon className={`w-4 h-4 ${
                      isActive 
                        ? item.isVoice ? 'text-white' : 'text-emerald-600'
                        : item.isVoice ? 'text-emerald-600' : 'text-slate-400'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.isVoice && (
                    <span className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-white shadow-[0_0_8px_white]' : 'bg-emerald-500 animate-pulse'
                    }`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Glass Panel: Language Selector & Live MySQL Status */}
        <div className="p-3.5 border-t border-white/60 space-y-2.5">
          
          {/* Language Selector Pill */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/50 border border-white/80 shadow-sm text-xs backdrop-blur-md">
            <div className="flex items-center space-x-2 text-slate-500 font-medium">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Language</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-emerald-700 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
              <option value="te-IN">Telugu (తెలుగు)</option>
              <option value="hi-IN">Hindi (हिंदी)</option>
            </select>
          </div>

          {/* MySQL Status Pill */}
          <div className="px-4 py-2.5 rounded-2xl bg-white/50 border border-white/80 flex items-center space-x-3 shadow-sm backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">Shop Inventory</p>
              <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>MySQL 8.0 Live</span>
              </div>
            </div>
          </div>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;
