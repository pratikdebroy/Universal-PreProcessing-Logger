import React, { useState } from "react";
import { X, Send, Sparkles, Terminal } from "lucide-react";

export function CustomLogInput({ isOpen, onClose, onProcessCustom }) {
  const [logText, setLogText] = useState("");
  const [loading, setLoading] = useState(false);

  const presets = [
    {
      name: "Fortinet-style UTM",
      text: "date=2026-08-31 time=21:20:00 devname=FG-100D srcip=10.14.2.8 dstip=192.168.1.100 proto=6 sport=51204 dport=443 action=deny msg='Policy Denied'",
    },
    {
      name: "Juniper SRX Security",
      text: "Aug 31 21:22:15 SRX-EDGE RT_FLOW_SESSION_DENY: session denied 172.16.10.5/50123->10.0.1.50/80 None None 6(0) default-deny",
    },
    {
      name: "Unknown Perimeter IDS",
      text: "EDGE-INTRUSION-01 || TIMESTAMP=2026-08-31T21:25:00Z || S_IP=185.220.101.5 || D_IP=10.0.0.50 || PROTOCOL=TCP || D_PORT=22 || DECISION=BLOCK || BYTES=1420",
    }
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!logText.trim()) return;
    setLoading(true);
    await onProcessCustom(logText);
    setLoading(false);
    setLogText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-cyan-500/30 p-6 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Ingest Custom / Live Perimeter Log
            </h3>
            <p className="text-xs text-slate-400">
              Test adaptive feature extraction on any arbitrary vendor format
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2">
            Try Sample Perimeter Presets:
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLogText(p.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-cyan-300 transition cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
              Raw Log Text Payload:
            </label>
            <textarea
              rows={4}
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Paste or type any raw perimeter device log here (e.g. 2026-08-31 FW01 ACTION=DENY SRC=10.0.1.2 DST=192.168.1.1 PROTO=TCP DPORT=80)"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !logText.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/60 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Processing..." : "Adaptively Ingest & Parse"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
