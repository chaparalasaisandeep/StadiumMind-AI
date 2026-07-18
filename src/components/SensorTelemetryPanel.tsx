import React, { useState, useEffect, useCallback } from "react";
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Wrench, 
  Wifi, 
  Cpu, 
  Battery, 
  Clock, 
  Zap, 
  Droplet, 
  Tv2, 
  Maximize2,
  RefreshCw,
  Search,
  Check
} from "lucide-react";
import { AppNotification } from "../types";

interface SensorItem {
  id: string;
  name: string;
  type: "turnstile" | "camera" | "environmental" | "power" | "water";
  status: "online" | "warning" | "offline" | "calibrating";
  zone: string;
  value: string;
  lastActive: string;
  battery: number;
}

interface SensorTelemetryPanelProps {
  stadiumName: string;
  onNewNotification?: (notif: AppNotification) => void;
}

const SensorTelemetryPanel = React.memo(function SensorTelemetryPanel({ stadiumName, onNewNotification }: SensorTelemetryPanelProps) {
  const [sensors, setSensors] = useState<SensorItem[]>([
    { id: "SEN-01", name: "Gate A Turnstile Tracker", type: "turnstile", status: "online", zone: "Zone A North", value: "128 scans/min", lastActive: "Just now", battery: 94 },
    { id: "SEN-02", name: "AI Concourse Cam 104", type: "camera", status: "online", zone: "Sector 100", value: "88% clarity (High density)", lastActive: "Just now", battery: 100 },
    { id: "SEN-03", name: "Ambient Thermal Sensor West", type: "environmental", status: "online", zone: "Zone B West", value: "74°F / 45% RH", lastActive: "2m ago", battery: 85 },
    { id: "SEN-04", name: "Solar Microgrid Inverter 3", type: "power", status: "online", zone: "Roof Deck", value: "14.2 kW active generation", lastActive: "Just now", battery: 100 },
    { id: "SEN-05", name: "Gate C Scanner Array", type: "turnstile", status: "warning", zone: "Gate C Ingress", value: "Intermittent laser sync issues", lastActive: "1m ago", battery: 42 },
    { id: "SEN-06", name: "Reclaimed Water Pipe Sensor", type: "water", status: "online", zone: "Outer Ring Systems", value: "8.4 L/s Flow Rate", lastActive: "5m ago", battery: 78 },
    { id: "SEN-07", name: "Concourse Mist Cooler North", type: "environmental", status: "offline", zone: "Zone A North", value: "Mister head pressure failure", lastActive: "15m ago", battery: 0 },
    { id: "SEN-08", name: "VIP Deck AI Face Camera", type: "camera", status: "online", zone: "Suite Level East", value: "No active congestion", lastActive: "Just now", battery: 98 },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorItem | null>(null);

  // Auto-fluctuate values slightly to look highly interactive & realistic
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => {
          if (s.status !== "online") return s;
          if (s.type === "turnstile") {
            const currentVal = parseInt(s.value);
            const change = Math.floor(Math.random() * 15) - 7;
            const newVal = Math.max(20, currentVal + change);
            return { ...s, value: `${newVal} scans/min`, lastActive: "Just now" };
          }
          if (s.type === "power") {
            const currentVal = parseFloat(s.value);
            const change = (Math.random() * 0.8) - 0.4;
            const newVal = Math.max(1.0, currentVal + change).toFixed(1);
            return { ...s, value: `${newVal} kW active generation`, lastActive: "Just now" };
          }
          return s;
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleRunDiagnostics = useCallback(() => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    setTimeout(() => {
      setIsDiagnosing(false);
      // Randomize or trigger warnings
      const offlineCount = sensors.filter(s => s.status === "offline").length;
      const warningCount = sensors.filter(s => s.status === "warning").length;
      setDiagnosticResult(
        `All active nodes query complete. Total monitored: ${sensors.length}. Online: ${sensors.length - offlineCount - warningCount}. Warnings flagged: ${warningCount}. Fatal faults: ${offlineCount}. Routing telemetry to stadium operations center.`
      );
    }, 2000);
  }, [sensors]);

  const handleRecalibrate = useCallback((sensorId: string) => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id === sensorId) {
          return {
            ...s,
            status: "online",
            value: s.type === "turnstile" ? "120 scans/min" : s.type === "environmental" ? "72°F / 40% RH" : s.type === "power" ? "12.0 kW active generation" : "Nominal operational value",
            battery: Math.max(s.battery, 80),
            lastActive: "Just now"
          };
        }
        return s;
      })
    );

    const target = sensors.find(s => s.id === sensorId);
    if (target && onNewNotification) {
      onNewNotification({
        id: `notif-recal-${Date.now()}`,
        type: "crowd",
        message: `Sensor Recalibration Complete: ${target.name} (${target.id}) at ${target.zone} successfully reset and online.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isRead: false
      });
    }

    if (selectedSensor?.id === sensorId) {
      setSelectedSensor((prev) => prev ? { ...prev, status: "online", battery: Math.max(prev.battery, 80) } : null);
    }
  }, [sensors, onNewNotification]);

  const handleSimulateMalfunction = useCallback((sensorId: string) => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id === sensorId) {
          return {
            ...s,
            status: "offline",
            value: "Lost data connection stream",
            battery: 0,
            lastActive: "Disconnected"
          };
        }
        return s;
      })
    );

    const target = sensors.find(s => s.id === sensorId);
    if (target && onNewNotification) {
      onNewNotification({
        id: `notif-malf-${Date.now()}`,
        type: "emergency",
        message: `CRITICAL FAULT DETECTED: ${target.name} (${target.id}) in ${target.zone} reported fatal error and dropped offline!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isRead: false
      });
    }

    if (selectedSensor?.id === sensorId) {
      setSelectedSensor((prev) => prev ? { ...prev, status: "offline", battery: 0 } : null);
    }
  }, [sensors, onNewNotification]);

  const filteredSensors = sensors.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || s.type === filterType;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const onlineCount = sensors.filter(s => s.status === "online").length;
  const warningCount = sensors.filter(s => s.status === "warning").length;
  const offlineCount = sensors.filter(s => s.status === "offline").length;

  return (
    <div id="sensor-telemetry-panel" className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-sky-400" />
            Sensor Telemetry & Node Diagnostics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time IoT gateway. Track temperature index monitors, automated turnstiles, smart cameras, and eco-recovery inverters at {stadiumName}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRunDiagnostics}
            disabled={isDiagnosing}
            className="px-3 py-1.5 bg-sky-650 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isDiagnosing ? "animate-spin" : ""}`} />
            {isDiagnosing ? "Running Query..." : "Execute Full Diagnostics"}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850/70">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Monitored Nodes</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-white">{sensors.length}</span>
            <span className="text-[10px] text-sky-400 font-mono">100% active</span>
          </div>
        </div>
        
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850/70">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Active / Online</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-emerald-400">{onlineCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {((onlineCount / sensors.length) * 100).toFixed(0)}% optimal
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850/70">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Pending Faults</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-lg font-bold ${offlineCount > 0 ? "text-rose-400" : "text-slate-400"}`}>{offlineCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">Requires dispatch</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850/70">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Sensor Warning Flag</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-lg font-bold ${warningCount > 0 ? "text-amber-400" : "text-slate-400"}`}>{warningCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">Slight variance</span>
          </div>
        </div>
      </div>

      {/* Diagnostics output window if just run */}
      {diagnosticResult && (
        <div className="p-3.5 bg-slate-950 border border-slate-850 text-xs font-mono text-[#6EB8E1] rounded-xl flex items-start gap-2.5">
          <Cpu className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{diagnosticResult}</p>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search sensors by ID, Name or Zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-950 border border-slate-850 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="turnstile">Turnstiles</option>
          <option value="camera">Cameras</option>
          <option value="environmental">Environmental</option>
          <option value="power">Solar & Power</option>
          <option value="water">Water Sensors</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-950 border border-slate-850 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="online">Online</option>
          <option value="warning">Warning</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* Sensors Grid / Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sensor List (2 Columns on large screens) */}
        <div className="lg:col-span-2 space-y-2 max-h-[440px] overflow-y-auto pr-1">
          {filteredSensors.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-850">
              No active sensors match your query filters.
            </div>
          ) : (
            filteredSensors.map((sensor) => {
              const isSelected = selectedSensor?.id === sensor.id;
              return (
                <div
                  key={sensor.id}
                  onClick={() => setSelectedSensor(sensor)}
                  className={`p-3 border rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? "bg-slate-800/40 border-sky-500/50 shadow-md shadow-sky-950/10" 
                      : "bg-slate-950/30 border-slate-850 hover:bg-slate-900/30 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      sensor.status === "online" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : sensor.status === "warning"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {sensor.type === "turnstile" && <Tv2 className="h-4 w-4" />}
                      {sensor.type === "camera" && <Activity className="h-4 w-4" />}
                      {sensor.type === "environmental" && <Cpu className="h-4 w-4" />}
                      {sensor.type === "power" && <Zap className="h-4 w-4" />}
                      {sensor.type === "water" && <Droplet className="h-4 w-4" />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{sensor.id}</span>
                        <h4 className="text-xs font-semibold text-slate-200 truncate max-w-[150px]">{sensor.name}</h4>
                      </div>
                      <div className="flex gap-3 text-[10px] text-slate-500 mt-1 font-mono">
                        <span>{sensor.zone}</span>
                        <span>•</span>
                        <span className="truncate max-w-[140px]">{sensor.value}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <Battery className={`h-3.5 w-3.5 ${sensor.battery > 50 ? "text-slate-400" : sensor.battery > 20 ? "text-amber-400" : "text-rose-500 animate-pulse"}`} />
                      <span className="text-[10px] text-slate-400 font-mono">{sensor.battery}%</span>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                      sensor.status === "online" 
                        ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/20" 
                        : sensor.status === "warning"
                        ? "bg-amber-950/30 text-amber-400 border border-amber-500/20"
                        : "bg-rose-950/30 text-rose-400 border border-rose-500/20"
                    }`}>
                      {sensor.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Sensor Control Drawer */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between min-h-[300px]">
          {selectedSensor ? (
            <div className="space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-500/20">{selectedSensor.id}</span>
                    <h3 className="text-xs font-bold text-white mt-1.5">{selectedSensor.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedSensor.zone}</p>
                  </div>
                  
                  <div className={`p-2 rounded-lg ${
                    selectedSensor.status === "online" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : selectedSensor.status === "warning"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {selectedSensor.status === "online" && <CheckCircle2 className="h-4.5 w-4.5" />}
                    {selectedSensor.status === "warning" && <AlertTriangle className="h-4.5 w-4.5 animate-pulse" />}
                    {selectedSensor.status === "offline" && <XCircle className="h-4.5 w-4.5" />}
                  </div>
                </div>

                <div className="border-t border-b border-slate-900 py-3 space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Reading</span>
                    <span className="text-slate-200 font-bold">{selectedSensor.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Battery Charge</span>
                    <span className="text-slate-200">{selectedSensor.battery}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signal Status</span>
                    <span className="text-slate-200 flex items-center gap-1">
                      <Wifi className="h-3 w-3 text-sky-400" /> Excellent
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Activity Check</span>
                    <span className="text-slate-400">{selectedSensor.lastActive}</span>
                  </div>
                </div>
              </div>

              {/* Control Action Buttons */}
              <div className="space-y-2 mt-4">
                <button
                  onClick={() => handleRecalibrate(selectedSensor.id)}
                  className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/20 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Recalibrate / Reset Node
                </button>
                
                {selectedSensor.status !== "offline" ? (
                  <button
                    onClick={() => handleSimulateMalfunction(selectedSensor.id)}
                    className="w-full py-1.5 bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/30 border border-slate-850 text-slate-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    Simulate Sensor Failure
                  </button>
                ) : (
                  <div className="text-[10px] text-center text-rose-400 p-2 bg-rose-950/20 border border-rose-900/25 rounded-lg flex items-center justify-center gap-1.5 font-mono">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    Sensor Offline. Dispatch required!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <Activity className="h-8 w-8 text-slate-700 animate-pulse" />
              <h4 className="text-xs font-semibold text-slate-400 mt-2">No Node Selected</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[180px]">Select any active IoT node from the list to view diagnostic graphs and execute hard resets.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
});
export default SensorTelemetryPanel;
