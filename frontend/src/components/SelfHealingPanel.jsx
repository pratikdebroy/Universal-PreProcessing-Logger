import React from "react";
import { Wrench, AlertTriangle, ArrowDown, CheckCircle2, RefreshCw, Sparkles, ShieldCheck } from "lucide-react";

export function SelfHealingPanel({ reports, onTriggerSelfHealing, isHealing, hasDrift }) {
  const latestReport = reports && reports.length > 0 ? reports[reports.length - 1] : null;

  return (
    <div className="glass-panel rounded-2xl border border-amber-500/40 p-5 md:p-6 shadow-2xl space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Autonomous Self-Healing & Drift Evolution
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 font-mono">
                R&D Novelty
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Detects schema mutations, synthesizes updated parser rules, and recovers confidence
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSelfHealing}
          disabled={isHealing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/60 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isHealing ? "animate-spin" : ""}`} />
          <span>Execute Self-Healing Pipeline</span>
        </button>
      </div>

      {/* Visual Timeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Step 1: Parser v1 */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">1. Known Parser</div>
          <div className="text-sm font-bold text-white mt-1">fw_v1.0</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Expects: ACTION, SRC, DST, PROTO, DPORT
          </div>
          <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold inline-block">
            100% Baseline Conf
          </div>
        </div>

        {/* Step 2: Format Drift */}
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50">
          <div className="text-[10px] text-rose-400 font-mono uppercase font-bold">2. Format Drift</div>
          <div className="text-sm font-bold text-white mt-1">Key Mutation</div>
          <div className="text-[11px] text-rose-200 mt-1 font-mono">
            ACT, SRCIP, DSTIP, P, DP
          </div>
          <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-rose-300 font-bold inline-block">
            Degraded (25% Conf)
          </div>
        </div>

        {/* Step 3: Drift Detection */}
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50">
          <div className="text-[10px] text-amber-400 font-mono uppercase font-bold">3. Drift Detector</div>
          <div className="text-sm font-bold text-white mt-1">Anomaly Flagged</div>
          <div className="text-[11px] text-amber-200 mt-1">
            Parser failed to map present IP & action tokens.
          </div>
          <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-300 font-bold inline-block">
            Trigger Re-Analysis
          </div>
        </div>

        {/* Step 4: Adaptive Synthesis */}
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/50">
          <div className="text-[10px] text-indigo-400 font-mono uppercase font-bold">4. Rule Evolution</div>
          <div className="text-sm font-bold text-white mt-1">Synthesizing v2</div>
          <div className="text-[11px] text-indigo-200 mt-1 font-mono">
            SRCIP → src_ip, P → proto
          </div>
          <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-bold inline-block">
            Auto-Generated
          </div>
        </div>

        {/* Step 5: Self-Healed Output */}
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50">
          <div className="text-[10px] text-emerald-400 font-mono uppercase font-bold">5. Self-Healed Event</div>
          <div className="text-sm font-bold text-emerald-300 mt-1">fw_v2.0 Active</div>
          <div className="text-[11px] text-slate-300 mt-1">
            Log reparsed & normalized successfully.
          </div>
          <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold inline-block">
            100% Recovered Conf
          </div>
        </div>
      </div>

      {/* Latest Healing Report Diff Card */}
      {latestReport ? (
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Latest Autonomous Healing Report ({latestReport.status})
            </span>
            <span className="text-slate-400 text-[11px]">
              Affected Log: {latestReport.affected_log_id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Parser Transition:</span>
              <span className="text-rose-400 line-through mr-2">{latestReport.previous_parser_version}</span>
              <span className="text-emerald-400 font-bold">→ {latestReport.new_parser_version}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Confidence Recovery:</span>
              <span className="text-rose-400 mr-2">{latestReport.previous_confidence}%</span>
              <span className="text-emerald-400 font-bold">→ {latestReport.new_confidence}%</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Repaired Logs:</span>
              <span className="text-emerald-400 font-bold">{latestReport.repaired_count} Event Normalized</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            <strong className="text-slate-300">Resolved Key Mutations:</strong>{" "}
            {Object.entries(latestReport.drifted_keys).map(([k, v]) => `${k} -> ${v}`).join(", ")}
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Click <strong>"3. Inject Format Drift"</strong> above, then click <strong>"4. Trigger Self-Healing"</strong> to watch the autonomous recovery pipeline in action.</span>
        </div>
      )}
    </div>
  );
}
