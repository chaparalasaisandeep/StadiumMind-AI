import React from "react";
import { StadiumState } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from "recharts";
import { Users, TrendingUp, Clock, AlertTriangle } from "lucide-react";

interface OperationalMetricsProps {
  stadiumState: StadiumState;
}

const OperationalMetrics = React.memo(function OperationalMetrics({ stadiumState }: OperationalMetricsProps) {
  // Concession metrics for Recharts
  const concessionData = stadiumState.concessions.map((c) => ({
    name: c.name.split(" (")[0], // Clean up names for fit
    queueTime: c.queueTime,
    status: c.status
  }));

  // Gate entrance metrics for Recharts
  const gateData = stadiumState.activeGates.map((g) => ({
    name: g.name.split(" (")[0],
    flow: g.flowRate,
    pressure: g.pressure === "high" ? 100 : g.pressure === "medium" ? 60 : 30
  }));

  // Simulated queue backlog time trend
  const trendData = [
    { time: "11:00", fans: 8000, congestion: 20 },
    { time: "12:00", fans: 24000, congestion: 40 },
    { time: "13:00", fans: 48000, congestion: 75 },
    { time: "14:00", fans: 72000, congestion: 95 },
    { time: "15:00", fans: 82500, congestion: 80 },
    { time: "16:00", fans: 79000, congestion: 50 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#6EB8E1]" />
            Live Crowd & Queuing Telemetry
          </h3>
          <p className="text-[11px] text-slate-400">Real-time throughput metrics sourced from gate scanners and concession sensors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric 1: Concession Queue Wait-Times */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 flex flex-col h-[230px]">
          <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            Concession Waiting Queue (Minutes)
          </h4>
          <div className="flex-1 text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={concessionData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tickSize={4} />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", color: "#f8fafc" }}
                  itemStyle={{ color: "#fbbf24" }}
                />
                <Bar dataKey="queueTime" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 2: Gate Pressure & Flow Rates */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 flex flex-col h-[230px]">
          <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#6EB8E1]" />
            Gate Entry Rates (Fans/Minute)
          </h4>
          <div className="flex-1 text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gateData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", color: "#f8fafc" }}
                  itemStyle={{ color: "#38bdf8" }}
                />
                <Bar dataKey="flow" fill="#6EB8E1" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metric 3: Stadium Arrival Curve (Area Chart) */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 flex flex-col h-[180px]">
        <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
          Occupancy Timeline & Arrival Backlog Trend
        </h4>
        <div className="flex-1 text-[11px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="colorFans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8ABE6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#C8ABE6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", color: "#f8fafc" }} />
              <Area type="monotone" dataKey="fans" stroke="#C8ABE6" fillOpacity={1} fill="url(#colorFans)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});
export default OperationalMetrics;
