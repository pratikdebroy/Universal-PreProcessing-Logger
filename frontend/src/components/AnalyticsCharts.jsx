import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { BarChart3, PieChart as PieIcon, ShieldAlert, Activity } from "lucide-react";

export function AnalyticsCharts({ events, stats }) {
  // 1. Compute format distribution
  const formatCounts = {};
  events.forEach((e) => {
    const key = e.device || "Unknown Node";
    formatCounts[key] = (formatCounts[key] || 0) + 1;
  });
  const deviceData = Object.entries(formatCounts).map(([name, value]) => ({ name, value }));

  // 2. Status distribution
  const statusData = [
    { name: "Known", count: stats.known_count, fill: "#10b981" },
    { name: "Adaptive", count: stats.adaptive_count, fill: "#6366f1" },
    { name: "Self-Healed", count: stats.self_healed_count, fill: "#f59e0b" },
    { name: "Failed", count: stats.failed_count, fill: "#f43f5e" },
  ];

  // 3. Action distribution
  const actionCounts = { DENY: 0, ALLOW: 0, BLOCK: 0, DROP: 0 };
  events.forEach((e) => {
    const act = (e.action || "").toUpperCase();
    if (actionCounts[act] !== undefined) {
      actionCounts[act]++;
    } else if (act) {
      actionCounts[act] = (actionCounts[act] || 0) + 1;
    }
  });
  const actionData = Object.entries(actionCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  // 4. Confidence over time / event index
  const confidenceData = events.map((e, idx) => ({
    event: `#${idx + 1}`,
    confidence: e.confidence,
    device: e.device,
  }));

  const COLORS = ["#06b6d4", "#10b981", "#6366f1", "#f59e0b", "#f43f5e", "#8b5cf6"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Perimeter Security Telemetry & Processing Analytics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chart 1: Processing Status */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span>Engine Parsing Status</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Device Node Distribution */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span>Perimeter Nodes</span>
            <PieIcon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData.length ? deviceData : [{ name: "No data", value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Security Verdict Actions */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span>Perimeter Action Verdicts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionData.length ? actionData : [{ name: "No data", value: 1 }]}
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {actionData.map((entry, index) => {
                    const color = ["DENY", "DROP", "BLOCK"].includes(entry.name) ? "#f43f5e" : "#10b981";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Confidence Score Distribution */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span>Parser Confidence Curve</span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">Avg {stats.avg_confidence}%</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={confidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="event" stroke="#64748b" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="confidence" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
