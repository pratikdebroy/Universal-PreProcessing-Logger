import React from "react";
import { Play, Sparkles, AlertCircle, Wrench, RotateCcw, PlusCircle, Database } from "lucide-react";

export function DemoControls({
  onLoadBaseline,
  onInjectUnknown,
  onInjectDrift,
  onTriggerSelfHealing,
  onOpenCustomLog,
  onClear,
  loadingAction,
  hasDrift,
}) {
  return (
    <div className="glass-panel p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Demo Sequence Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Judge Demonstration Sequence
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-medium">
                5-Min Demo Story
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Execute live autonomous ingestion, adaptive inference, drift detection, and self-healing.
            </p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Button 1: Load Baseline */}
          <button
            onClick={onLoadBaseline}
            disabled={loadingAction !== null}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 hover:shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Load Baseline Logs</span>
          </button>

          {/* Button 2: Inject Unknown (EDGE-X) */}
          <button
            onClick={() => onInjectUnknown("edgex")}
            disabled={loadingAction !== null}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-xs border border-indigo-400/30 shadow-md shadow-indigo-950/40 hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>2. Inject Unknown Vendor (EDGE-X)</span>
          </button>

          {/* Button 3: Inject Unknown (RT-X9) */}
          <button
            onClick={() => onInjectUnknown("rtx9")}
            disabled={loadingAction !== null}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>Unknown RT-X9</span>
          </button>

          {/* Button 4: Inject Format Drift */}
          <button
            onClick={onInjectDrift}
            disabled={loadingAction !== null}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-slate-950 font-bold text-xs border border-amber-400/40 shadow-md shadow-amber-950/40 hover:shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>3. Inject Format Drift</span>
          </button>

          {/* Button 5: Trigger Self-Healing */}
          <button
            onClick={onTriggerSelfHealing}
            disabled={loadingAction !== null}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              hasDrift
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/80 shadow-lg shadow-emerald-950/60 animate-bounce"
                : "bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>4. Trigger Self-Healing</span>
          </button>

          {/* Custom Log Input */}
          <button
            onClick={onOpenCustomLog}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 text-xs font-semibold border border-cyan-900/50 hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Custom Log</span>
          </button>

          {/* Clear Store */}
          <button
            onClick={onClear}
            disabled={loadingAction !== null}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/40 transition-all cursor-pointer"
            title="Clear all logs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
