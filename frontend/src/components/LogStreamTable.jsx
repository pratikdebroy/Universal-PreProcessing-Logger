import React from "react";
import { Eye, ShieldAlert, Sparkles, Wrench, CheckCircle, AlertTriangle, ArrowUpRight } from "lucide-react";

export function LogStreamTable({ events, selectedEventId, onSelectEvent, onFilterChange, currentFilter }) {
  const getStatusBadge = (status, driftDetected) => {
    if (driftDetected || status === "failed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-950/70 border border-rose-500/50 text-rose-300 text-[11px] font-bold tracking-wide">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          FAILED / DRIFTED
        </span>
      );
    }
    if (status === "self_healed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-950/70 border border-amber-500/50 text-amber-300 text-[11px] font-bold tracking-wide">
          <Wrench className="w-3 h-3 text-amber-400" />
          SELF-HEALED
        </span>
      );
    }
    if (status === "adaptive") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-950/70 border border-indigo-500/50 text-indigo-300 text-[11px] font-bold tracking-wide">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          ADAPTIVE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold tracking-wide">
        <CheckCircle className="w-3 h-3 text-emerald-400" />
        KNOWN
      </span>
    );
  };

  const getActionBadge = (action) => {
    if (!action) return <span className="text-slate-500 text-xs">-</span>;
    const act = action.toUpperCase();
    if (["DENY", "DROP", "BLOCK", "REJECT", "DISCARD"].includes(act)) {
      return (
        <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-600/40 text-rose-300 font-mono text-[11px] font-bold">
          {act}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 font-mono text-[11px] font-bold">
        {act}
      </span>
    );
  };

  const getConfidencePill = (confidence) => {
    let color = "bg-emerald-950 border-emerald-500/40 text-emerald-400";
    if (confidence < 60) color = "bg-rose-950 border-rose-500/40 text-rose-400";
    else if (confidence < 80) color = "bg-amber-950 border-amber-500/40 text-amber-400";

    return (
      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-mono font-bold ${color}`}>
        {confidence}%
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Live Perimeter Event Stream
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {events.length} records
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time feed normalized into universal schema
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {["all", "known", "adaptive", "self_healed", "failed"].map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                currentFilter === f
                  ? "bg-cyan-600 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Device / Host</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Traffic Details (Source → Dest)</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Parser Engine</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {events.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-600" />
                    <span>No logs loaded yet. Click <strong>"1. Load Baseline Logs"</strong> above.</span>
                  </div>
                </td>
              </tr>
            ) : (
              events.map((ev) => {
                const isSelected = selectedEventId === ev.id;
                return (
                  <tr
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className={`hover:bg-slate-800/40 transition cursor-pointer ${
                      isSelected ? "bg-cyan-950/30 border-l-2 border-l-cyan-400" : ""
                    } ${ev.drift_detected ? "bg-rose-950/20" : ""}`}
                  >
                    {/* Device */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        {ev.device || "UNKNOWN_NODE"}
                      </div>
                      <div className="text-[10px] text-slate-400">{ev.device_type}</div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {ev.timestamp || "-"}
                    </td>

                    {/* Traffic Flow */}
                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-200">
                        {ev.source_ip || "?"}
                        {ev.source_port ? `:${ev.source_port}` : ""}
                        <span className="text-slate-500 mx-1.5">→</span>
                        {ev.destination_ip || "?"}
                        {ev.destination_port ? `:${ev.destination_port}` : ""}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        Proto: <span className="font-mono text-cyan-400">{ev.protocol || "UNKNOWN"}</span>
                        {ev.bytes ? ` • ${ev.bytes} bytes` : ""}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4">
                      {getActionBadge(ev.action)}
                    </td>

                    {/* Parser Version */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {ev.parser_version}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {getStatusBadge(ev.status, ev.drift_detected)}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4">
                      {getConfidencePill(ev.confidence)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 text-slate-300 transition cursor-pointer"
                        title="Deep inspect event"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
