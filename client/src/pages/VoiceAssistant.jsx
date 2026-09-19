import React from 'react';
import { VoiceAssistant as VoiceStudio } from '../components/voice/VoiceAssistant';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import GlassCard from '../components/glass/GlassCard';
import GlassBadge from '../components/glass/GlassBadge';

export const VoiceAssistant = ({ voiceRecognition, onInventoryUpdated }) => {
  const exampleCategories = [
    {
      title: 'Inventory Operations',
      examples: [
        '"Add 20 bags of rice"',
        '"Remove 5 bags of rice"',
        '"Rice 20 bags add cheyyi"',
        '"5 bags rice teesey"',
      ],
    },
    {
      title: 'Inventory Inquiries',
      examples: [
        '"How much rice do I have?"',
        '"Rice stock entha undi?"',
        '"Check sugar stock"',
        '"What is running low?"',
      ],
    },
    {
      title: 'AI Business Intelligence',
      examples: [
        '"How is my rice stock?"',
        '"What do I need to buy today?"',
        '"What should I reorder?"',
        '"Show today\'s stock changes"',
      ],
    },
    {
      title: 'Smart Safeguards',
      examples: [
        '"Remove 50 bags of rice" (Warns & suggests balance)',
        '"Add 10 oil" (Clarifies multiple options)',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Page Header Glass Card */}
      <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              AI Voice Assistant Studio
            </h1>
            <GlassBadge variant="ai" size="sm">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Live Assistant</span>
            </GlassBadge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Voice-first inventory control with smart confirmation, confidence checking, and sales analytics
          </p>
        </div>
      </GlassCard>

      {/* Main Voice Interactive Studio Component */}
      <VoiceStudio
        voiceRecognition={voiceRecognition}
        onInventoryUpdated={onInventoryUpdated}
        compact={false}
      />

      {/* Voice Assistant Capability Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {exampleCategories.map((cat, idx) => (
          <GlassCard key={idx} className="p-4 text-left">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>{cat.title}</span>
            </h4>
            <ul className="space-y-1.5">
              {cat.examples.map((ex, exIdx) => (
                <li key={exIdx} className="text-[11px] text-slate-600 font-medium bg-white/60 p-2.5 rounded-xl border border-white/80 shadow-xs">
                  {ex}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>

      {/* Architectural Guarantee Badge */}
      <div className="bg-slate-900/90 backdrop-blur-2xl text-white rounded-3xl p-5 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="font-medium text-slate-300 leading-relaxed">
            <strong className="text-white">Strict Safety Architecture:</strong> The voice assistant extracts intent and entities, but backend business logic and atomic MySQL transactions enforce all validations before stock is updated.
          </p>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full whitespace-nowrap border border-emerald-500/20 shadow-sm">
          Atomic MySQL Protected
        </span>
      </div>

    </div>
  );
};

export default VoiceAssistant;
