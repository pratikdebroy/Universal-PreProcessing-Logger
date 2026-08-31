import React from "react";
import { ArrowRight, CheckCircle2, Cpu, FileText, Fingerprint, Layers, ShieldCheck, Wrench } from "lucide-react";

export function PipelineVisualizer({ stats, hasDrift, isProcessing }) {
  const stages = [
    { id: "ingest", name: "1. Ingestion", desc: "Local Perimeter Stream", icon: FileText, count: stats.total_ingested, color: "text-slate-300" },
    { id: "fingerprint", name: "2. Fingerprint", desc: "Structural Delimiters", icon: Fingerprint, count: stats.total_ingested, color: "text-cyan-400" },
    { id: "classify", name: "3. Classification", desc: "Known vs Unseen", icon: Layers, count: stats.known_count + stats.unknown_count, color: "text-blue-400" },
    { id: "adaptive", name: "4. Adaptive Parser", desc: "Dynamic Synonym Mapping", icon: Cpu, count: stats.adaptive_count, color: "text-indigo-400" },
    { id: "confidence", name: "5. Confidence Scorer", desc: "Deterministic Scoring", icon: ShieldCheck, count: `${stats.avg_confidence}%`, color: "text-emerald-400" },
    { id: "normalize", name: "6. Normalization", desc: "Universal Defense Schema", icon: CheckCircle2, count: stats.total_processed, color: "text-emerald-400" },
    { id: "self_heal", name: "7. Self-Healing", desc: "Drift Evolution v2", icon: Wrench, count: stats.self_healed_count, color: hasDrift ? "text-amber-400" : "text-slate-400", alert: hasDrift },
  ];

  return (
    <div className="glass-panel p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Real-Time Pipeline Execution Topology
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Air-Gapped Local Flow
        </span>
      </div>

      <div className="flex items-center justify-between min-w-[760px] gap-2">
        {stages.map((st, idx) => {
          const Icon = st.icon;
          return (
            <React.Fragment key={st.id}>
              <div
                className={`flex-1 p-3 rounded-xl border transition-all ${
                  st.alert
                    ? "bg-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-950/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${st.color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {st.count}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100 truncate">
                  {st.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {st.desc}
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="text-slate-600 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
