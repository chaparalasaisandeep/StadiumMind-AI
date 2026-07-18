import React from "react";
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
import { useSensorTelemetry, SensorItem } from "../hooks/useSensorTelemetry";

interface SensorTelemetryPanelProps {
  stadiumName: string;
  onNewNotification?: (notif: AppNotification) => void;
}

const SensorTelemetryPanel = React.memo(function SensorTelemetryPanel({ stadiumName, onNewNotification }: SensorTelemetryPanelProps) {
  const {
    sensors,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    isDiagnosing,
    diagnosticResult,
    selectedSensor,
    setSelectedSensor,
    handleRunDiagnostics,
    handleRecalibrate,
    handleSimulateMalfunction,
    filteredSensors,
    onlineCount,
    warningCount,
    offlineCount
  } = useSensorTelemetry(onNewNotification);

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

      {/* Main Grid: List on Left, Active Selected Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sensor Inventory list */}
        <div className="lg:col-span-7 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredSensors.length === 0 ? (
            <div className="text-center py-8 bg-slate-950/30 rounded-xl border border-slate-850/50">
              <span className="text-xs text-slate-500 font-mono">No active nodes match the specified filter query.</span>
            </div>
          ) : (
            filteredSensors.map((sensor) => (
              <div 
                key={sensor.id}
                onClick={() => setSelectedSensor(sensor)}
                className={`p-3 bg-slate-950/40 hover:bg-slate-900 border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  selectedSensor?.id === sensor.id ? "border-sky-500/50 bg-slate-900/60 shadow-lg" : "border-slate-850/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${
                    sensor.status === "online" ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" :
                    sensor.status === "warning" ? "bg-amber-950/20 border-amber-500/20 text-amber-400" :
                    "bg-rose-950/20 border-rose-500/20 text-rose-400"
                  }`}>
                    {sensor.type === "turnstile" && <Check className="h-4 w-4" />}
                    {sensor.type === "camera" && <Tv2 className="h-4 w-4" />}
                    {sensor.type === "environmental" && <Clock className="h-4 w-4" />}
                    {sensor.type === "power" && <Zap className="h-4 w-4" />}
                    {sensor.type === "water" && <Droplet className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">{sensor.name}</span>
                      <span className="text-[9px] font-mono text-slate-500">{sensor.id}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                      <span>ZONE: {sensor.zone}</span>
                      <span>BATT: {sensor.battery}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-medium text-slate-300 font-mono">{sensor.value}</span>
                  <span className={`h-2 w-2 rounded-full ${
                    sensor.status === "online" ? "bg-emerald-500" :
                    sensor.status === "warning" ? "bg-amber-500" :
                    "bg-rose-500"
                  }`} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Node Inspector Pane */}
        <div className="lg:col-span-5 bg-slate-950/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-between h-[360px]">
          {selectedSensor ? (
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">Telemetry Inspector</span>
                    <h3 className="text-sm font-bold text-white mt-1">{selectedSensor.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">UUID_REF: {selectedSensor.id}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    selectedSensor.status === "online" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" :
                    selectedSensor.status === "warning" ? "bg-amber-950/40 text-amber-400 border border-amber-500/20" :
                    "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                  }`}>
                    {selectedSensor.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900/50">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase">Last Activity</span>
                    <span className="text-xs text-white font-medium mt-1 block">{selectedSensor.lastActive}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900/50 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">Power Level</span>
                      <span className="text-xs text-white font-medium mt-1 block">{selectedSensor.battery}%</span>
                    </div>
                    <Battery className={`h-4.5 w-4.5 ${selectedSensor.battery < 20 ? "text-rose-500" : "text-slate-400"}`} />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900/50 col-span-2">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase">Live Data Payload</span>
                    <span className="text-xs text-sky-400 font-mono mt-1 block font-medium">{selectedSensor.value}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-900">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRecalibrate(selectedSensor.id)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wrench className="h-3.5 w-3.5 text-sky-400" />
                    Recalibrate Node
                  </button>
                  <button
                    onClick={() => handleSimulateMalfunction(selectedSensor.id)}
                    disabled={selectedSensor.status === "offline"}
                    className="py-2 px-3 bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/30 text-slate-400 hover:text-rose-400 disabled:opacity-30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    title="Simulate hardware malfunction"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 text-center leading-relaxed">
                  Calibrations transmit diagnostic RF signals to verify sensor metrics alignment. Simulation testing triggers automated emergency alerts.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <Cpu className="h-8 w-8 text-slate-700 animate-pulse mb-3" />
              <h4 className="text-xs font-semibold text-slate-400">Node Inspector Idle</h4>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                Select any active IoT sensor from the inventory list to inspect detailed parameters, execute micro-calibrations, or simulate fault triggers.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
});

export default SensorTelemetryPanel;
