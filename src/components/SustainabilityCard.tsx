import React from "react";
import { Leaf, Zap, Droplet } from "lucide-react";
import { SustainabilityMetric } from "../types";

interface SustainabilityCardProps {
  sustainabilityData: SustainabilityMetric;
}

export default function SustainabilityCard({ sustainabilityData }: SustainabilityCardProps) {
  return (
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
  );
}
