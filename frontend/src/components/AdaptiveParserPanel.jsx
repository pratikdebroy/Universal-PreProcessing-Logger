import React from "react";
import { Sparkles, CheckCircle2, ShieldCheck, Cpu, ArrowRight, Code, Key, ListTree } from "lucide-react";

export function AdaptiveParserPanel({ event }) {
  if (!event) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-500">
        <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm">Select any event from the stream above to inspect its adaptive feature extraction and dynamic semantic mappings.</p>
      </div>
    );
  }

  const features = event.extracted_features || {};
  const mappings = event.mappings || [];
  const confidence = event.confidence_breakdown || {
    timestamp_score: 20,
    source_ip_score: 20,
    destination_ip_score: 20,
    protocol_score: 15,
    action_score: 15,
    port_score: 5,
    schema_completeness_score: 5,
    total_confidence: event.confidence,
    rating: event.confidence >= 80 ? "HIGH" : event.confidence >= 60 ? "MEDIUM" : "LOW",
    details: [],
  };

  return (
    <div className="glass-panel rounded-2xl border border-indigo-500/30 p-5 md:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Adaptive Parser & Feature Extraction Inspector
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-mono">
                {event.parser_version}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous schema resolution without vendor-specific hardcoding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-indigo-300 uppercase">
            {event.status}
          </span>
        </div>
      </div>

      {/* 1. Raw Log Payload */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-cyan-400" />
          Raw Ingested Perimeter Log
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all leading-relaxed">
          {event.raw_log}
        </div>
      </div>

      {/* 2. Detected Features Grid */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <ListTree className="w-3.5 h-3.5 text-indigo-400" />
          Dissected Structural Features
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {/* IPs */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">IP Tokens</div>
            <div className="text-xs font-mono font-bold text-white mt-1">
              {features.ips?.length ? features.ips.join(", ") : event.source_ip ? `${event.source_ip}, ${event.destination_ip || ''}` : "None"}
            </div>
          </div>

          {/* Protocols */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Protocol</div>
            <div className="text-xs font-mono font-bold text-cyan-400 mt-1">
              {event.protocol || "UNKNOWN"}
            </div>
          </div>

          {/* Ports */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Ports</div>
            <div className="text-xs font-mono font-bold text-indigo-300 mt-1">
              {event.destination_port || event.source_port || "None"}
            </div>
          </div>

          {/* Action */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Action Verdict</div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
              {event.action || "None"}
            </div>
          </div>

          {/* Delimiters */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Delimiters</div>
            <div className="text-xs font-mono font-bold text-amber-300 mt-1">
              {features.delimiters?.length ? features.delimiters.join("  ") : "|  :  ="}
            </div>
          </div>

          {/* Device */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Device Node</div>
            <div className="text-xs font-mono font-bold text-slate-200 mt-1 truncate">
              {event.device || "UNKNOWN"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dynamic Semantic Mapping Table */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-emerald-400" />
          Dynamic Semantic Mappings Inferred
        </div>
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Raw Key / Token</th>
                <th className="py-2.5 px-3"></th>
                <th className="py-2.5 px-3">Target Schema Field</th>
                <th className="py-2.5 px-3">Inferred Value</th>
                <th className="py-2.5 px-3">Inference Rule / Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {mappings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-3 text-center text-slate-500 font-sans">
                    Standard pre-configured parser applied.
                  </td>
                </tr>
              ) : (
                mappings.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-bold text-amber-300">{m.raw_key}</td>
                    <td className="py-2.5 px-1 text-slate-600">→</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-300">{m.target_field}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{m.sample_value || "-"}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{m.match_reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Deterministic Confidence Breakdown */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Confidence Score Breakdown
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Score:</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {event.confidence}% ({confidence.rating})
            </span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Timestamp:</span>
              <span className="font-mono text-cyan-400">+{confidence.timestamp_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${(confidence.timestamp_score / 20) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Source IP:</span>
              <span className="font-mono text-cyan-400">+{confidence.source_ip_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${(confidence.source_ip_score / 20) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Destination IP:</span>
              <span className="font-mono text-cyan-400">+{confidence.destination_ip_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${(confidence.destination_ip_score / 20) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Protocol & Action:</span>
              <span className="font-mono text-cyan-400">+{confidence.protocol_score + confidence.action_score}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${((confidence.protocol_score + confidence.action_score) / 30) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
