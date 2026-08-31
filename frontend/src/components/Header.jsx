import React from "react";
import { ShieldCheck, ShieldAlert, Cpu, Activity, Lock, RefreshCw } from "lucide-react";

export function Header({ stats, onOpenAirGap, isLive, onRefresh }) {
  return (
    <header className="border-b border-slate-800 bg-[#0b1120]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <ShieldCheck className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0b1120] animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                NTRO Universal Adaptive Log Preprocessor
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-medium">
                  SIH26156
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Intelligent Local Preprocessing for Heterogeneous Perimeter & Router Logs
            </p>
          </div>
        </div>

        {/* Right: Operational Badges & Air-Gap Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Air-Gap / Local Mode Button */}
          <button
            onClick={onOpenAirGap}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-xs font-semibold hover:bg-emerald-900/40 transition-all cursor-pointer shadow-sm hover:shadow-emerald-950/50"
            title="Click to view air-gap local architecture"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>LOCAL / AIR-GAPPED</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>

          {/* Engine Status Pills */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pipeline:</span>
            <span className="text-cyan-300 font-semibold">Active</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Adaptive Engine:</span>
            <span className="text-indigo-300 font-semibold">Ready</span>
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Refresh logs & stats"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
