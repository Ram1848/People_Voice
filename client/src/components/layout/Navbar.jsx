import React from 'react';
import { 
  Mic, 
  LayoutDashboard, 
  Package, 
  History, 
  AlertTriangle, 
  FolderKanban,
  Globe
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, language, setLanguage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'voice', label: 'Voice Assistant', icon: Mic, highlight: true },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'alerts', label: 'Alerts & Reorder', icon: AlertTriangle },
    { id: 'products', label: 'Products', icon: FolderKanban },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">People Voice</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Voice-Powered Inventory for Small Businesses</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight 
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'bg-slate-100 text-emerald-700 font-semibold'
                      : item.highlight
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive && !item.highlight ? 'text-emerald-600' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 transition-colors">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none focus:outline-none cursor-pointer text-slate-700 font-medium"
                title="Select Speech Recognition Language"
              >
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
                <option value="te-IN">Telugu (తెలుగు)</option>
                <option value="hi-IN">Hindi (हिंदी)</option>
              </select>
            </div>

            {/* Mobile quick tab select */}
            <div className="md:hidden">
              <button
                onClick={() => setActiveTab('voice')}
                className="p-2 rounded-lg bg-emerald-600 text-white"
                title="Voice Assistant"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-1 border-t border-slate-100 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md whitespace-nowrap ${
                  isActive ? 'bg-emerald-600 text-white font-medium' : 'text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
