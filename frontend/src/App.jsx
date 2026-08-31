import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DemoControls } from "./components/DemoControls";
import { StatCards } from "./components/StatCards";
import { PipelineVisualizer } from "./components/PipelineVisualizer";
import { LogStreamTable } from "./components/LogStreamTable";
import { AdaptiveParserPanel } from "./components/AdaptiveParserPanel";
import { SelfHealingPanel } from "./components/SelfHealingPanel";
import { NormalizedJsonViewer } from "./components/NormalizedJsonViewer";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import { AirGapModal } from "./components/AirGapModal";
import { CustomLogInput } from "./components/CustomLogInput";
import { api } from "./services/api";
import { AlertCircle, CheckCircle2, Sparkles, Wrench, Shield, Layers, Code, BarChart3 } from "lucide-react";

export default function App() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    total_ingested: 0,
    total_processed: 0,
    known_count: 0,
    unknown_count: 0,
    adaptive_count: 0,
    self_healed_count: 0,
    failed_count: 0,
    avg_confidence: 0,
    active_parsers_count: 3,
  });
  const [healingReports, setHealingReports] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loadingAction, setLoadingAction] = useState(null);
  const [activeTab, setActiveTab] = useState("stream"); // stream | adaptive | healing | json | analytics
  const [isAirGapOpen, setIsAirGapOpen] = useState(false);
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchState = async () => {
    try {
      const [eventsData, statsData, reportsData] = await Promise.all([
        api.getEvents(),
        api.getStats(),
        api.getHealingReports(),
      ]);
      setEvents(eventsData);
      setStats(statsData);
      setHealingReports(reportsData);

      if (eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[eventsData.length - 1]);
      }
    } catch (err) {
      console.error("Failed to connect to preprocessor API:", err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleLoadBaseline = async () => {
    setLoadingAction("baseline");
    try {
      const res = await api.loadBaseline();
      await fetchState();
      if (res && res.length > 0) {
        setSelectedEvent(res[0]);
      }
      showToast("Baseline router, firewall, and syslog logs ingested & parsed (100% confidence).", "success");
    } catch (e) {
      showToast("Error loading baseline logs", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInjectUnknown = async (kind = "edgex") => {
    setLoadingAction("unknown");
    try {
      const res = await api.injectUnknown(kind);
      await fetchState();
      setSelectedEvent(res);
      setActiveTab("adaptive");
      showToast(`Unknown vendor (${res.device}) detected! Adaptively parsed with semantic mapping.`, "adaptive");
    } catch (e) {
      showToast("Error injecting unknown log", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInjectDrift = async () => {
    setLoadingAction("drift");
    try {
      const res = await api.injectDrift();
      await fetchState();
      setSelectedEvent(res);
      setActiveTab("healing");
      showToast("Format drift detected! Parser v1 failed, confidence degraded to 25%.", "drift");
    } catch (e) {
      showToast("Error injecting drift", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleTriggerSelfHealing = async () => {
    setLoadingAction("healing");
    try {
      const reports = await api.triggerSelfHealing();
      await fetchState();
      setActiveTab("healing");
      if (reports.length > 0) {
        showToast("Self-healing successful! Synthesized Parser v2.0 and recovered confidence to 100%.", "success");
      } else {
        showToast("No active drift to heal.", "info");
      }
    } catch (e) {
      showToast("Error triggering self-healing", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleProcessCustom = async (rawText) => {
    try {
      const res = await api.processCustom(rawText);
      await fetchState();
      setSelectedEvent(res);
      setActiveTab("adaptive");
      showToast(`Custom log ingested & parsed with ${res.confidence}% confidence!`, "success");
    } catch (e) {
      showToast("Error processing custom log", "error");
    }
  };

  const handleClear = async () => {
    setLoadingAction("clear");
    try {
      await api.clearAll();
      await fetchState();
      setSelectedEvent(null);
      showToast("Store and demo fixtures cleared.", "info");
    } catch (e) {
      showToast("Error clearing store", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const hasDrift = events.some((e) => e.drift_detected || e.status === "failed");

  const filteredEvents = events.filter((e) => {
    if (filter === "all") return true;
    if (filter === "failed") return e.drift_detected || e.status === "failed";
    return e.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-fadeIn ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-500 text-emerald-200"
              : toast.type === "drift"
              ? "bg-rose-950 border-rose-500 text-rose-200"
              : toast.type === "adaptive"
              ? "bg-indigo-950 border-indigo-500 text-indigo-200"
              : "bg-slate-900 border-slate-700 text-slate-200"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === "drift" && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === "adaptive" && <Sparkles className="w-4 h-4 text-indigo-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        stats={stats}
        onOpenAirGap={() => setIsAirGapOpen(true)}
        isLive={true}
        onRefresh={fetchState}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* 1. Demo Controls */}
        <DemoControls
          onLoadBaseline={handleLoadBaseline}
          onInjectUnknown={handleInjectUnknown}
          onInjectDrift={handleInjectDrift}
          onTriggerSelfHealing={handleTriggerSelfHealing}
          onOpenCustomLog={() => setIsCustomInputOpen(true)}
          onClear={handleClear}
          loadingAction={loadingAction}
          hasDrift={hasDrift}
        />

        {/* 2. Stat Cards */}
        <StatCards stats={stats} />

        {/* 3. Pipeline Flow Visualizer */}
        <PipelineVisualizer stats={stats} hasDrift={hasDrift} />

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("stream")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "stream"
                ? "bg-cyan-600 text-slate-950 shadow-md shadow-cyan-950/60"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Live Log Stream & Normalization</span>
          </button>

          <button
            onClick={() => setActiveTab("adaptive")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "adaptive"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/60"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Adaptive Parser Inspector</span>
            {stats.adaptive_count > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 font-mono">
                {stats.adaptive_count}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("healing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "healing"
                ? "bg-amber-600 text-slate-950 shadow-md shadow-amber-950/60 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Self-Healing & Drift Timeline</span>
            {hasDrift && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("json")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "json"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/60"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Normalized JSON Schema</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "analytics"
                ? "bg-cyan-700 text-white shadow-md shadow-cyan-950/60"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>SOC Telemetry Analytics</span>
          </button>
        </div>

        {/* Tab 1: Stream Table & Split View */}
        {activeTab === "stream" && (
          <div className="space-y-6">
            <LogStreamTable
              events={filteredEvents}
              selectedEventId={selectedEvent?.id}
              onSelectEvent={(ev) => setSelectedEvent(ev)}
              onFilterChange={setFilter}
              currentFilter={filter}
            />

            {selectedEvent && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdaptiveParserPanel event={selectedEvent} />
                <NormalizedJsonViewer event={selectedEvent} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Adaptive Deep Dive */}
        {activeTab === "adaptive" && (
          <div className="space-y-6">
            <AdaptiveParserPanel event={selectedEvent} />
            <LogStreamTable
              events={events.filter((e) => e.status === "adaptive")}
              selectedEventId={selectedEvent?.id}
              onSelectEvent={(ev) => setSelectedEvent(ev)}
              onFilterChange={setFilter}
              currentFilter="adaptive"
            />
          </div>
        )}

        {/* Tab 3: Self Healing */}
        {activeTab === "healing" && (
          <div className="space-y-6">
            <SelfHealingPanel
              reports={healingReports}
              onTriggerSelfHealing={handleTriggerSelfHealing}
              isHealing={loadingAction === "healing"}
              hasDrift={hasDrift}
            />
            {selectedEvent && <NormalizedJsonViewer event={selectedEvent} />}
          </div>
        )}

        {/* Tab 4: JSON Explorer */}
        {activeTab === "json" && (
          <div className="space-y-6">
            <NormalizedJsonViewer event={selectedEvent} />
            <LogStreamTable
              events={filteredEvents}
              selectedEventId={selectedEvent?.id}
              onSelectEvent={(ev) => setSelectedEvent(ev)}
              onFilterChange={setFilter}
              currentFilter={filter}
            />
          </div>
        )}

        {/* Tab 5: Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <AnalyticsCharts events={events} stats={stats} />
          </div>
        )}
      </main>

      {/* Air-Gap Architecture Modal */}
      <AirGapModal
        isOpen={isAirGapOpen}
        onClose={() => setIsAirGapOpen(false)}
      />

      {/* Custom Log Ingestion Modal */}
      <CustomLogInput
        isOpen={isCustomInputOpen}
        onClose={() => setIsCustomInputOpen(false)}
        onProcessCustom={handleProcessCustom}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0b1120] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        SIH 2026 Problem Statement SIH26156 • NTRO Log Preprocessing Prototype • 100% Air-Gapped Local Architecture
      </footer>
    </div>
  );
}
