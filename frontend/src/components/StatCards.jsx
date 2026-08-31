import React from "react";
import { Database, CheckCircle, Sparkles, Wrench, ShieldCheck, TrendingUp } from "lucide-react";

export function StatCards({ stats }) {
  const getConfidenceColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/40 bg-emerald-950/30";
    if (score >= 60) return "text-amber-400 border-amber-500/40 bg-amber-950/30";
    return "text-rose-400 border-rose-500/40 bg-rose-950/30";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Ingested */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Ingested
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats.total_ingested}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Perimeter telemetry</div>
        </div>
        <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-400">
          <Database className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Processed & Normalized */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Normalized Events
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {stats.total_processed}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Standard defense schema</div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/20 text-emerald-400">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Unknown / Adaptive Formats */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Unknown Formats
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
            {stats.adaptive_count}
          </div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">Adaptive zero-code parsed</div>
        </div>
        <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/20 text-indigo-400">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Self-Healed Parsers */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Self-Healed
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {stats.self_healed_count}
          </div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">Drift auto-repaired</div>
        </div>
        <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/20 text-amber-400">
          <Wrench className="w-5 h-5" />
        </div>
      </div>

      {/* 5. Average Parser Confidence */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between col-span-2 md:col-span-1">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Avg Confidence
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {stats.avg_confidence}%
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getConfidenceColor(stats.avg_confidence)}`}>
              {stats.avg_confidence >= 80 ? "HIGH" : stats.avg_confidence >= 60 ? "MED" : "LOW"}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Deterministic score</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
