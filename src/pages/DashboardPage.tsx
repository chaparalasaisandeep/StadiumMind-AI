import React, { lazy, Suspense } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import SustainabilityCard from "../components/SustainabilityCard";
import RoleSelector from "../components/RoleSelector";
import AICommandCenter from "../components/AICommandCenter";
import AIRecommendationsPanel from "../components/AIRecommendationsPanel";
import OperationalMetrics from "../components/OperationalMetrics";
import EmergencyIncidentLogger from "../components/EmergencyIncidentLogger";
import NotificationCenter from "../components/NotificationCenter";
import OperationsSimulator from "../components/OperationsSimulator";
import { SkeletonCard } from "../components/ui/Skeleton";
import { motion } from "motion/react";
import { useDashboard } from "../hooks/useDashboard";
import { STADIUMS } from "../constants";

// Route sub-panels loaded lazily to optimize bundle size and TTI
const StadiumMap = lazy(() => import("../components/StadiumMap"));
const AccessibilitySuite = lazy(() => import("../components/AccessibilitySuite"));
const SensorTelemetryPanel = lazy(() => import("../components/SensorTelemetryPanel"));
const LogisticsGuardsPanel = lazy(() => import("../components/LogisticsGuardsPanel"));

import { 
  Activity, 
  CheckCircle,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck
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
        <DashboardHeader
          selectedStadium={selectedStadium}
          setSelectedStadium={setSelectedStadium}
          stadiums={STADIUMS}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dbStatus={dbStatus}
          dbError={dbError}
          isDataLoading={isDataLoading}
          onLogout={onLogout}
        />

        {/* WORKSPACE AREA */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
          
          {/* Advanced Notification Hub */}
          <NotificationCenter
            notifications={stadiumState.incidents.map(inc => ({
              id: inc.id,
              type: inc.type === "congestion" ? "crowd" as const : "emergency" as const,
              message: `Incident logged at ${inc.location}: [${inc.severity.toUpperCase()}] ${inc.title}.`,
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
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <AIRecommendationsPanel stadiumState={stadiumState} stadiumId={selectedStadium.id} />
                </motion.div>
                
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
                      <div className="h-6 w-1/3 bg-slate-800 animate-pulse rounded" />
                      <div className="h-4 w-2/3 bg-slate-800 animate-pulse rounded" />
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
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <OperationalMetrics stadiumState={stadiumState} />
                </motion.div>

                {/* Sustainability Metric Card */}
                <SustainabilityCard sustainabilityData={sustainabilityData} />

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
