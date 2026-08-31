import React, { useState } from "react";
import { X, Lock, ShieldCheck, Server, Cpu, Database, AlertTriangle, CheckCircle2 } from "lucide-react";

export function AirGapModal({ isOpen, onClose }) {
  const [activeMode, setActiveMode] = useState("local");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-cyan-500/30 p-6 md:p-8 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Air-Gapped & Local Processing Architecture
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-mono">
                SECURE ON-PREM
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Zero-Trust Local Execution Engine Designed for Defense & Critical Infrastructure Perimeters
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => setActiveMode("local")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === "local"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            LOCAL AIR-GAPPED MODE (DEFAULT & ACTIVE)
          </button>
          <button
            onClick={() => setActiveMode("cloud")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === "cloud"
                ? "bg-slate-800 text-cyan-300 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-4 h-4" />
            CLOUD HYBRID MODE (OPTIONAL)
          </button>
        </div>

        {activeMode === "local" ? (
          <div className="space-y-6">
            {/* Visual Pipeline Box */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs">
              <div className="text-slate-400 mb-3 text-[11px] uppercase tracking-wider font-semibold">
                Boundary Enforcement Diagram:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <div className="text-cyan-400 font-bold mb-1">1. Device Logs</div>
                  <div className="text-[10px] text-slate-400">Routers, FW, Gateways</div>
                </div>
                <div className="flex items-center justify-center text-slate-600">→</div>
                <div className="p-2.5 rounded bg-slate-900 border border-emerald-800/60 text-slate-300">
                  <div className="text-emerald-400 font-bold mb-1">2. Local Engine</div>
                  <div className="text-[10px] text-slate-400">FastAPI & Python Core</div>
                </div>
                <div className="flex items-center justify-center text-slate-600">→</div>
                <div className="p-2.5 rounded bg-slate-900 border border-indigo-800/60 text-slate-300">
                  <div className="text-indigo-400 font-bold mb-1">3. Universal Output</div>
                  <div className="text-[10px] text-slate-400">Normalized Defense Events</div>
                </div>
              </div>
            </div>

            {/* Key Air-Gap Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 mt-0.5">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">No External LLM / Cloud API</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Feature extraction, semantic synonym resolution, and drift detection run 100% locally with zero API egress.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Zero Sensitive Data Leakage</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Internal IP topology, firewall rules, and perimeter metadata never leave the secure defense host.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-950/80 text-indigo-400 mt-0.5">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Deterministic Confidence</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Scoring uses explainable weighted verification instead of unpredictable stochastic black boxes.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Offline Resilience</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Fully functional in isolated command centers without WAN or public internet connections.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-amber-950/30 border border-amber-500/40 text-slate-300 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              Cloud Mode Notice
            </div>
            <p className="text-xs text-slate-400">
              For high-security defense networks (NTRO, CERT-In, Military NOCs), Cloud Mode is strictly optional and disabled by default. The local engine provides full adaptive parsing without telemetry egress.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            Acknowledge & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
