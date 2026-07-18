import React, { lazy, Suspense } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { UserRole, StadiumLocation } from "../types";
import { STADIUMS } from "../constants";
import RoleSelector from "../components/RoleSelector";
import AICommandCenter from "../components/AICommandCenter";
import AIRecommendationsPanel from "../components/AIRecommendationsPanel";
import OperationalMetrics from "../components/OperationalMetrics";
import EmergencyIncidentLogger from "../components/EmergencyIncidentLogger";
import NotificationCenter from "../components/NotificationCenter";
import OperationsSimulator from "../components/OperationsSimulator";
import { Skeleton, SkeletonCard } from "../components/ui/Skeleton";
import { motion } from "motion/react";
import { useDashboard } from "../hooks/useDashboard";

// Route sub-panels loaded lazily to optimize bundle size and TTI
const StadiumMap = lazy(() => import("../components/StadiumMap"));
const AccessibilitySuite = lazy(() => import("../components/AccessibilitySuite"));
const SensorTelemetryPanel = lazy(() => import("../components/SensorTelemetryPanel"));
const LogisticsGuardsPanel = lazy(() => import("../components/LogisticsGuardsPanel"));

import { 
  MapPin, 
  Activity, 
  CheckCircle,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Search,
  RefreshCw,
  Leaf,
  Zap,
  Droplet
} from "lucide-react";

interface DashboardPageProps {
  onLogout: () => void;
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
  const {
    selectedStadium,
    setSelectedStadium,
    stadiumState,
    volunteerTasks,
    searchQuery,
    setSearchQuery,
    activeConsole,
    setActiveConsole,
    sustainabilityData,
    isDataLoading,
    dbStatus,
    dbError,
    currentRole,
    handleDismissNotification,
    handleDismissAllNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleNewNotification,
    handleRoleChange,
    handleAddIncident,
    handleDispatchIncident,
    handleResolveIncident,
    handleSimulationTriggered,
    handleResetSimulation
  } = useDashboard(onLogout);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-[#6EB8E1]/30 antialiased flex">
      
      <DashboardSidebar activeConsole={activeConsole} setActiveConsole={setActiveConsole} onLogout={onLogout} />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR */}
        <header className="bg-slate-950/80 border-b border-slate-900 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#6EB8E1]" />
                <select
                  id="stadium-select-input"
                  value={selectedStadium.id}
                  onChange={(e) => {
                    const target = STADIUMS.find((s) => s.id === e.target.value);
                    if (target) setSelectedStadium(target);
                  }}
                  aria-label="Select Stadium" className="bg-transparent text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer border-b border-slate-800 rounded-sm"
                >
                  {STADIUMS.map((stadium) => (
                    <option key={stadium.id} value={stadium.id} className="bg-slate-950 text-white">
                      {stadium.name} ({stadium.city})
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={onLogout} className="lg:hidden p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search sectors" className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-8 pr-3 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                {dbStatus === "connected" && (
                  <div className="px-3 py-1 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-mono text-emerald-400">FIRESTORE LIVE</span>
                  </div>
                )}
                {dbStatus === "syncing" && (
                  <div className="px-3 py-1 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-center gap-1.5">
                    <RefreshCw className="h-2.5 w-2.5 text-amber-400 animate-spin" />
                    <span className="text-[9px] font-mono text-amber-400">SYNCING</span>
                  </div>
                )}
                {dbStatus === "fallback" && (
                  <div className="group relative px-3 py-1 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="text-[9px] font-mono text-rose-400 cursor-help">OFFLINE FALLBACK</span>
                    {/* Tooltip on hover */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 text-slate-200 text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {dbError || "Lost connection to live datastore."}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => {}}
                  disabled={isDataLoading}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  title="Force Refresh Data"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isDataLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
          
          {/* Advanced Notification Hub */}
          <NotificationCenter
            notifications={stadiumState.incidents.map(inc => ({
              id: inc.id,
              type: inc.type === "congestion" ? "crowd" as const : "emergency" as const,
              message: `Incidentlogged at ${inc.location}: [${inc.severity.toUpperCase()}] ${inc.title}.`,
              timestamp: inc.timestamp,
              isRead: inc.status === "resolved"
            }))}
            onDismiss={handleDismissNotification}
            onDismissAll={handleDismissAllNotifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />

          {/* Core Role Selector Switch */}
          <RoleSelector currentRole={currentRole} onChangeRole={handleRoleChange} />

          {/* Mobile Console Tab Switcher (Visible only on mobile/tablet screens where sidebar is hidden) */}
          <div className="flex lg:hidden bg-slate-950 p-1 border border-slate-900 rounded-xl gap-1" id="mobile-console-switcher">
            <button
              onClick={() => setActiveConsole("operations")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeConsole === "operations" 
                  ? "bg-slate-900 border border-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Operations
            </button>
            <button
              onClick={() => setActiveConsole("telemetry")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeConsole === "telemetry" 
                  ? "bg-slate-900 border border-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Telemetry
            </button>
            <button
              onClick={() => setActiveConsole("logistics")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeConsole === "logistics" 
                  ? "bg-slate-900 border border-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Logistics
            </button>
          </div>

          {/* Conditional Console Panels */}
          {activeConsole === "operations" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="operations-bento-grid">
              
              {/* Column 1 & 2: Maps and Analytics */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* AI Recommendations Panel */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><AIRecommendationsPanel stadiumState={stadiumState} stadiumId={selectedStadium.id} /></motion.div>
                
                {/* Stadium Map */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Activity className="h-4.5 w-4.5 text-[#6EB8E1]" />
                        Interactive Perimeter Node Map
                      </h3>
                      <p className="text-xs text-slate-400">Simulated world cup venue geofence. Select incident pins to dispatch first responders.</p>
                    </div>
                  </div>

                  <Suspense fallback={
                    <div className="h-[450px] w-full flex flex-col gap-4 p-4 bg-slate-900/30 border border-slate-800 rounded-xl">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3 bg-slate-800" />
                        <Skeleton className="h-3 w-2/3 bg-slate-800" />
                      </div>
                      <div className="flex-1 w-full bg-slate-850/50 rounded-lg animate-pulse flex items-center justify-center">
                        <span className="text-xs text-slate-500 font-mono">Loading Perimeter OSM Map...</span>
                      </div>
                    </div>
                  }>
                    <StadiumMap 
                      stadium={selectedStadium}
                      stadiumState={stadiumState}
                      onSelectIncident={handleDispatchIncident}
                    />
                  </Suspense>
                </div>

                {/* Specific Sub Panels based on Role */}
                {currentRole === "Volunteer" && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                      <CheckCircle className="h-4.5 w-4.5 text-teal-400" />
                      Active Volunteer Missions & Hydration Units
                    </h3>
                    <div className="space-y-3">
                      {volunteerTasks.map((task) => (
                        <div key={task.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-200">{task.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">{task.description}</p>
                            <div className="flex gap-4 text-[10px] text-slate-500 mt-2 font-mono">
                              <span>SECTOR: {task.section}</span>
                              <span>ASSIGNED_TO: {task.assignedTo}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/40 text-amber-400 border border-amber-500/20">
                            {task.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentRole === "Accessibility" && (
                  <Suspense fallback={<SkeletonCard />}>
                    <AccessibilitySuite stadiumName={selectedStadium.name} />
                  </Suspense>
                )}

                {currentRole === "Transport" && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                      Transit Capacity & Wait Time Monitors
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Shuttle Queue</span>
                        <h4 className="text-lg font-bold text-white mt-1">{stadiumState.transit.shuttles.waitTime} Mins Wait</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{stadiumState.transit.shuttles.active} Shuttles Active</p>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Parking Lot load</span>
                        <h4 className="text-lg font-bold text-amber-400 mt-1">{stadiumState.transit.parkingLots.occupancy}% Load</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{stadiumState.transit.parkingLots.status}</p>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Central Rail wait</span>
                        <h4 className="text-lg font-bold text-rose-400 mt-1">{stadiumState.transit.trainStation.congestion} Traffic</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{stadiumState.transit.trainStation.waitTime} Mins queue</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics & Recharts charts */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><OperationalMetrics stadiumState={stadiumState} /></motion.div>

                {/* Sustainability Metric Card */}
                <div className="bg-gradient-to-br from-[#061a15]/40 to-slate-950/90 border border-emerald-950/50 rounded-2xl p-4 shadow-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900 mb-3.5">
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Leaf className="h-4 w-4 text-emerald-400 animate-pulse" />
                        Green Footprint & Environmental Sustainability
                      </h3>
                      <p className="text-xs text-slate-400">
                        Live venue resource recovery metrics compiled from localized water reclamation sensors, solar inverter nodes, and organic composting centers.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 uppercase shrink-0">
                      ISO 14001 COMPLIANT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Waste Recycled */}
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                        <Leaf className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Waste Composted</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {sustainabilityData.wasteRecycledKg ? `${sustainabilityData.wasteRecycledKg.toLocaleString()} kg` : "0 kg"}
                        </h4>
                        <span className="text-[8px] text-emerald-500 block font-medium">94.2% compost efficiency</span>
                      </div>
                    </div>

                    {/* Energy Saved */}
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                        <Zap className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Energy Saved</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {sustainabilityData.energySavedKwh ? `${sustainabilityData.energySavedKwh.toLocaleString()} kWh` : "0 kWh"}
                        </h4>
                        <span className="text-[8px] text-amber-500 block font-medium">Solar microgrid contribution</span>
                      </div>
                    </div>

                    {/* Water Saved */}
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
                        <Droplet className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Water Reclaimed</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {sustainabilityData.waterSavedLitres ? `${sustainabilityData.waterSavedLitres.toLocaleString()} Litres` : "0 Litres"}
                        </h4>
                        <span className="text-[8px] text-sky-500 block font-medium">Rainwater harvesting active</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Column 3: AI Copilot and Crisis Dispatch Center */}
              <div className="space-y-6">
                
                {/* Operations Simulator */}
                <OperationsSimulator
                  currentRole={currentRole}
                  stadium={selectedStadium}
                  onSimulationTriggered={handleSimulationTriggered}
                  onResetSimulation={handleResetSimulation}
                  onChangeRole={handleRoleChange}
                />

                {/* Gemini Conversational Assistant */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-2">
                  <AICommandCenter 
                    currentRole={currentRole}
                    stadiumState={stadiumState}
                    onDispatchIncident={handleDispatchIncident}
                    stadiumName={selectedStadium.name}
                  />
                </motion.div>

                {/* Incident Logging panel */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <EmergencyIncidentLogger 
                    currentRole={currentRole}
                    stadiumState={stadiumState}
                    onAddIncident={handleAddIncident}
                    onDispatchIncident={handleDispatchIncident}
                    onResolveIncident={handleResolveIncident}
                  />
                </motion.div>

              </div>

            </div>
          )}

          {activeConsole === "telemetry" && (
            <Suspense fallback={<SkeletonCard />}>
              <SensorTelemetryPanel 
                stadiumName={selectedStadium.name}
                onNewNotification={handleNewNotification}
              />
            </Suspense>
          )}

          {activeConsole === "logistics" && (
            <Suspense fallback={<SkeletonCard />}>
              <LogisticsGuardsPanel 
                stadiumName={selectedStadium.name}
                onNewNotification={handleNewNotification}
              />
            </Suspense>
          )}

        </main>
      </div>

    </div>
  );
}
