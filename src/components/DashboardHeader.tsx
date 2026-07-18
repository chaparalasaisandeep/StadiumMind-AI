import React from "react";
import { MapPin, LogOut, Search, RefreshCw } from "lucide-react";
import { StadiumLocation } from "../types";

interface DashboardHeaderProps {
  selectedStadium: StadiumLocation;
  setSelectedStadium: (s: StadiumLocation) => void;
  stadiums: StadiumLocation[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  dbStatus: "connected" | "fallback" | "syncing";
  dbError: string | null;
  isDataLoading: boolean;
  onLogout: () => void;
}

export default function DashboardHeader({
  selectedStadium,
  setSelectedStadium,
  stadiums,
  searchQuery,
  setSearchQuery,
  dbStatus,
  dbError,
  isDataLoading,
  onLogout
}: DashboardHeaderProps) {
  return (
    <header className="bg-slate-950/80 border-b border-slate-900 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#6EB8E1]" />
            <select
              id="stadium-select-input"
              value={selectedStadium.id}
              onChange={(e) => {
                const target = stadiums.find((s) => s.id === e.target.value);
                if (target) setSelectedStadium(target);
              }}
              aria-label="Select Stadium" 
              className="bg-transparent text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer border-b border-slate-800 rounded-sm"
            >
              {stadiums.map((stadium) => (
                <option key={stadium.id} value={stadium.id} className="bg-slate-950 text-white">
                  {stadium.name} ({stadium.city})
                </option>
              ))}
            </select>
          </div>
          <button onClick={onLogout} className="lg:hidden p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400" aria-label="Log Out">
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
              aria-label="Search sectors" 
              className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-8 pr-3 py-1 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors"
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
  );
}
