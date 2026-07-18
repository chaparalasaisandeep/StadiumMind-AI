import React, { memo } from "react";
import { Tv2, LayoutDashboard, Activity, ShieldCheck, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import RoleSelector from "./RoleSelector";

interface DashboardSidebarProps {
  activeConsole: "operations" | "telemetry" | "logistics";
  setActiveConsole: (val: "operations" | "telemetry" | "logistics") => void;
  onLogout: () => void;
}

const DashboardSidebar = memo(function DashboardSidebar({ activeConsole, setActiveConsole, onLogout }: DashboardSidebarProps) {
  const { user } = useAuth();
  const currentRole = user?.role || "Fan";
  return (
      <aside className="w-64 bg-slate-950 border-r border-slate-900 hidden lg:flex flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#6EB8E1]/10 border border-[#6EB8E1]/20 rounded-xl">
              <Tv2 className="h-5 w-5 text-[#6EB8E1]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">StadiumMind AI</h1>
              <span className="text-[9px] font-mono text-slate-500 uppercase">SECTOR_OS v3.1</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block px-2 mb-2">Primary Console</span>
            <button 
              onClick={() => setActiveConsole("operations")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-left border ${
                activeConsole === "operations" 
                  ? "bg-slate-900 border-slate-800 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900 border-transparent"
              }`}
            >
              <LayoutDashboard className={`h-4 w-4 ${activeConsole === "operations" ? "text-[#6EB8E1]" : ""}`} />
              Operations Center
            </button>
            <button 
              onClick={() => setActiveConsole("telemetry")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-left border ${
                activeConsole === "telemetry" 
                  ? "bg-slate-900 border-slate-800 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900 border-transparent"
              }`}
            >
              <Activity className={`h-4 w-4 ${activeConsole === "telemetry" ? "text-[#6EB8E1]" : ""}`} />
              Sensor Telemetry
            </button>
            <button 
              onClick={() => setActiveConsole("logistics")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-left border ${
                activeConsole === "logistics" 
                  ? "bg-slate-900 border-slate-800 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900 border-transparent"
              }`}
            >
              <ShieldCheck className={`h-4 w-4 ${activeConsole === "logistics" ? "text-[#6EB8E1]" : ""}`} />
              Logistics Guards
            </button>
          </div>

          <div className="p-3 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-indigo-500/10 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1 text-[#C8ABE6]">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold">Advisory Active</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Simulation systems ready. Inject stress parameters via "Crowd Stress Simulator" to query the AI Advisor.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white truncate max-w-[120px]">{user?.displayName || "AUTHORITY"}</div>
              <div className="text-[9px] font-mono text-[#6EB8E1]">{currentRole}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
  );
});
export default DashboardSidebar;
