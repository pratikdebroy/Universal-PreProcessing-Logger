import React, { useState } from "react";
import { Code, Copy, Check, FileJson, LayoutGrid, SplitSquareVertical } from "lucide-react";

export function NormalizedJsonViewer({ event }) {
  const [activeTab, setActiveTab] = useState("json");
  const [copied, setCopied] = useState(false);

  if (!event) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-500">
        <FileJson className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm">Select an event to view its Universal Normalized Security Event JSON.</p>
      </div>
    );
  }

  const normalizedPayload = {
    id: event.id,
    timestamp: event.timestamp,
    device: event.device,
    device_type: event.device_type,
    source_ip: event.source_ip,
    destination_ip: event.destination_ip,
    source_port: event.source_port,
    destination_port: event.destination_port,
    protocol: event.protocol,
    action: event.action,
    event_type: event.event_type,
    severity: event.severity,
    bytes: event.bytes,
    raw_log: event.raw_log,
    parser_type: event.parser_type,
    parser_version: event.parser_version,
    confidence: event.confidence,
    status: event.status,
  };

  const jsonString = JSON.stringify(normalizedPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-5 md:p-6 shadow-2xl space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileJson className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Normalized Security Event View
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
            Universal Schema v1.0
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "json" ? "bg-cyan-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Normalized JSON
            </button>
            <button
              onClick={() => setActiveTab("fields")}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "fields" ? "bg-cyan-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Field Matrix
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "compare" ? "bg-cyan-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              Raw vs Structured
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Copy JSON to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tab 1: Normalized JSON */}
      {activeTab === "json" && (
        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-[380px]">
            {jsonString}
          </pre>
        </div>
      )}

      {/* Tab 2: Field Matrix */}
      {activeTab === "fields" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(normalizedPayload).map(([key, value]) => {
            if (key === "raw_log") return null;
            return (
              <div key={key} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold">
                  {key}
                </div>
                <div className="text-xs font-mono font-bold text-cyan-300 mt-1 break-all">
                  {value === null || value === undefined ? (
                    <span className="text-slate-600 font-normal italic">null</span>
                  ) : typeof value === "boolean" ? (
                    value ? "true" : "false"
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Raw vs Structured Comparison */}
      {activeTab === "compare" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-rose-400 font-bold uppercase text-[10px] mb-2">
              Raw Unstructured Log Input
            </div>
            <div className="text-slate-300 break-all leading-relaxed">
              {event.raw_log}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
            <div className="text-emerald-400 font-bold uppercase text-[10px] mb-2">
              Normalized Security Event Output
            </div>
            <div className="space-y-1 text-slate-300">
              <div><span className="text-slate-500">Source:</span> <span className="text-cyan-300 font-bold">{event.source_ip}:{event.source_port || '*'}</span></div>
              <div><span className="text-slate-500">Target:</span> <span className="text-cyan-300 font-bold">{event.destination_ip}:{event.destination_port || '*'}</span></div>
              <div><span className="text-slate-500">Protocol:</span> <span className="text-indigo-300 font-bold">{event.protocol}</span></div>
              <div><span className="text-slate-500">Action:</span> <span className="text-emerald-400 font-bold">{event.action}</span></div>
              <div><span className="text-slate-500">Device:</span> <span className="text-slate-200">{event.device}</span></div>
              <div><span className="text-slate-500">Confidence:</span> <span className="text-emerald-400 font-bold">{event.confidence}%</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
