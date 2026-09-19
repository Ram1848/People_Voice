import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import VoiceAssistant from './pages/VoiceAssistant.jsx';
import Inventory from './pages/Inventory.jsx';
import Transactions from './pages/Transactions.jsx';
import Products from './pages/Products.jsx';
import Insights from './pages/Insights.jsx';
import Alerts from './pages/Alerts.jsx';
import useVoiceRecognition from './hooks/useVoiceRecognition.js';
import { Mic, Menu } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Centralized voice recognition instance
  const voiceRecognition = useVoiceRecognition({
    language: 'en-IN',
  });

  const triggerInventoryRefresh = () => {
    setInventoryRefreshKey((k) => k + 1);
  };

  return (
    <div className="relative min-h-screen flex bg-slate-100/60 text-slate-900 font-sans selection:bg-emerald-500/20 selection:text-emerald-950 overflow-x-hidden">
      
      {/* LAYER 2: Apple Fluid Ambient Lighting Mesh Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Soft emerald light orb top right */}
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-emerald-400/18 via-teal-300/10 to-transparent blur-3xl" />
        
        {/* Soft sky-blue light orb middle left */}
        <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-sky-400/15 via-indigo-300/10 to-transparent blur-3xl" />
        
        {/* Soft lavender/purple light orb bottom right */}
        <div className="absolute -bottom-32 right-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-t from-purple-400/12 via-teal-200/8 to-transparent blur-3xl" />
      </div>

      {/* Desktop & Mobile Floating Glass Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={voiceRecognition.language}
        setLanguage={voiceRecognition.setLanguage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area (Offset for lg:w-72 floating sidebar + spacing) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-80 transition-all duration-300">
        
        {/* Mobile Frosted Header (Hidden on Desktop) */}
        <header className="sticky top-0 z-30 lg:hidden h-16 bg-white/75 backdrop-blur-2xl border-b border-white/80 px-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-2xl text-slate-600 hover:bg-white/60 active:scale-95 transition-all"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">People Voice</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                AI
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('voice')}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
            title="Voice Assistant"
          >
            <Mic className="w-4 h-4" />
          </button>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              key={inventoryRefreshKey}
              voiceRecognition={voiceRecognition}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'voice' && (
            <VoiceAssistant
              voiceRecognition={voiceRecognition}
              onInventoryUpdated={triggerInventoryRefresh}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              key={inventoryRefreshKey}
              onInventoryUpdated={triggerInventoryRefresh}
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions
              key={inventoryRefreshKey}
            />
          )}

          {activeTab === 'products' && (
            <Products
              key={inventoryRefreshKey}
              onInventoryUpdated={triggerInventoryRefresh}
            />
          )}

          {activeTab === 'insights' && (
            <Insights
              key={inventoryRefreshKey}
              onInventoryUpdated={triggerInventoryRefresh}
            />
          )}

          {activeTab === 'alerts' && (
            <Alerts
              key={inventoryRefreshKey}
              onInventoryUpdated={triggerInventoryRefresh}
            />
          )}
        </main>

        {/* Floating Apple Liquid Quick Voice Capsule (Visible on other tabs) */}
        {activeTab !== 'voice' && activeTab !== 'dashboard' && (
          <div className="fixed bottom-6 right-6 z-30">
            <button
              onClick={() => setActiveTab('voice')}
              className="flex items-center space-x-2.5 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.4)] border border-emerald-400/40 font-bold text-xs transition-all select-none backdrop-blur-md"
            >
              <Mic className="w-4 h-4" />
              <span>Voice Command</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}

export default App;
