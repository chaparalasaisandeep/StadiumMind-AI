import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Shuffle, 
  UserCheck, 
  Leaf, 
  AlertTriangle, 
  CheckSquare, 
  RefreshCw, 
  BrainCircuit, 
  Sparkles,
  Play,
  ArrowRight
} from "lucide-react";
import { organizerAIService } from "../services/organizerAI";
import { OrganizerAIResponse } from "../services/aiTypes";
import { StadiumState } from "../types";

interface AIRecommendationsPanelProps {
  stadiumState: StadiumState;
  stadiumId: string;
}

const AIRecommendationsPanel = React.memo(function AIRecommendationsPanel({ stadiumState, stadiumId }: AIRecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<OrganizerAIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationalFocus, setOperationalFocus] = useState<string>("Optimize Gate Congestion & Energy Utilization");
  
  // Track previous state to avoid unnecessary redundant AI trigger loops
  const prevStateRef = useRef<string>("");

  const fetchRecommendations = async (force: boolean = false) => {
    // Generate a simple state fingerprint to check if the simulation params changed
    const stateFingerprint = JSON.stringify({
      gates: stadiumState.activeGates.map(g => ({ id: g.id, pressure: g.pressure })),
      incidentsCount: stadiumState.incidents.filter(i => i.status !== "resolved").length,
      transitParking: stadiumState.transit.parkingLots.occupancy,
      stadiumId
    });

    if (!force && stateFingerprint === prevStateRef.current && recommendations) {
      return; // Skip redundant updates if telemetry hasn't changed
    }

    setLoading(true);
    setError(null);
    try {
      const response = await organizerAIService.optimizeStadiumOperations({
        stadiumState,
        operationalFocus: `${operationalFocus} (Venue: ${stadiumId})`
      });
      setRecommendations(response);
      prevStateRef.current = stateFingerprint;
    } catch (err: any) {
      console.error("AIRecommendationsPanel fetch failed:", err);
      setError("Unable to run central neural core recommendations. Offline fallback active.");
    } finally {
      setLoading(false);
    }
  };

  // Re-run whenever key simulation parameters change
  const gatesHash = stadiumState.activeGates.map(g => `${g.id}:${g.pressure}`).join(",");
  const activeIncidentsCount = stadiumState.incidents.filter(i => i.status !== "resolved").length;
  const parkingOccupancy = stadiumState.transit.parkingLots.occupancy;

  useEffect(() => {
    fetchRecommendations();
  }, [stadiumId, gatesHash, activeIncidentsCount, parkingOccupancy, operationalFocus]);

  // Fallback items if recommendations are loading or null
  const defaultRecommendations: OrganizerAIResponse = recommendations || {
    crowdAlerts: ["Analysing gate scanner telemetry streams...", "Reviewing active digital ticket queues."],
    bottlenecks: ["Locating congestion hotspots...", "Monitoring high pressure scanners."],
    staffingRecommendations: ["Calculating team allocation vectors...", "Determining dispatch protocols."],
    sustainabilitySuggestions: ["Measuring solar microgrid inverter levels...", "Sensing composting recovery rates."],
    riskWarnings: ["Assessing security logs...", "Checking active incident severities."],
    priorityActions: ["Standby for central coordinator commands..."],
    thinkingLog: "Organizer AI is mapping active telemetry streams."
  };

  const categories = [
    {
      title: "Crowd Alerts",
      description: "Scanner flow rates & gate queue dynamics",
      items: defaultRecommendations.crowdAlerts,
      icon: Users,
      color: "from-sky-500/15 to-sky-950/20 border-sky-500/20 text-sky-400 font-medium",
      badgeColor: "bg-sky-950/60 text-sky-400 border-sky-500/20"
    },
    {
      title: "Active Bottlenecks",
      description: "Inbound congestion & queue wait hotspots",
      items: defaultRecommendations.bottlenecks,
      icon: Shuffle,
      color: "from-orange-500/15 to-orange-950/20 border-orange-500/20 text-orange-400 font-medium",
      badgeColor: "bg-orange-950/60 text-orange-400 border-orange-500/20"
    },
    {
      title: "Staffing Recommendations",
      description: "Volunteer & marshal squad shifts",
      items: defaultRecommendations.staffingRecommendations,
      icon: UserCheck,
      color: "from-indigo-500/15 to-indigo-950/20 border-indigo-500/20 text-indigo-400 font-medium",
      badgeColor: "bg-indigo-950/60 text-indigo-400 border-indigo-500/20"
    },
    {
      title: "Sustainability Suggestions",
      description: "Solar conservation & recycling offsets",
      items: defaultRecommendations.sustainabilitySuggestions,
      icon: Leaf,
      color: "from-emerald-500/15 to-emerald-950/20 border-emerald-500/20 text-emerald-400 font-medium",
      badgeColor: "bg-emerald-950/60 text-emerald-400 border-emerald-500/20"
    },
    {
      title: "Risk Warnings",
      description: "Severe hazard indicators & incident response",
      items: defaultRecommendations.riskWarnings,
      icon: AlertTriangle,
      color: "from-rose-500/15 to-rose-950/20 border-rose-500/20 text-rose-400 font-medium",
      badgeColor: "bg-rose-950/60 text-rose-400 border-rose-500/20"
    },
    {
      title: "Priority Actions",
      description: "Critical steps for immediate dispatch",
      items: defaultRecommendations.priorityActions,
      icon: CheckSquare,
      color: "from-purple-500/15 to-purple-950/20 border-purple-500/20 text-purple-400 font-medium",
      badgeColor: "bg-purple-950/60 text-purple-400 border-purple-500/20"
    }
  ];

  return (
    <div id="ai-recommendations-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#6EB8E1]/10 border border-[#6EB8E1]/20 rounded-xl">
              <BrainCircuit className="h-5 w-5 text-[#6EB8E1] animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Executive Organizer AI Advisory
                <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-500/20">
                  REAL-TIME COGNITIVE LAYER
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuously processing stadium sensor feeds, digital telemetry, and active simulation parameters to balance resources.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            id="ai-operational-focus-select"
            value={operationalFocus}
            onChange={(e) => {
              setOperationalFocus(e.target.value);
              // Instantly re-fetch when focus changes
              setTimeout(() => fetchRecommendations(true), 100);
            }}
            className="bg-slate-950 border border-slate-850 text-[11px] text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#6EB8E1] cursor-pointer"
          >
            <option value="Optimize Gate Congestion & Energy">Focus: Congestion & Energy</option>
            <option value="Safety First & Incident Isolation">Focus: Safety & Incidents</option>
            <option value="Carbon Neutral Operations & Recycling">Focus: Waste & Composting</option>
            <option value="Maximum Throughput Efficiency">Focus: Transit & Entry Flow</option>
          </select>

          <button
            onClick={() => fetchRecommendations(true)}
            disabled={loading}
            className="p-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            title="Re-analyze Dashboard Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#6EB8E1]" : ""}`} />
            <span className="text-[10px] font-medium hidden md:inline">Run Audit</span>
          </button>
        </div>
      </div>

      {/* Grid of Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat, idx) => {
          const IconComponent = cat.icon;
          return (
            <div 
              key={idx} 
              className={`bg-gradient-to-br ${cat.color} border p-4 rounded-xl flex flex-col justify-between transition-all duration-350 hover:scale-[1.01] hover:shadow-lg relative overflow-hidden group`}
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-slate-950/40 border border-current flex items-center justify-center shrink-0`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border uppercase shrink-0 ${cat.badgeColor}`}>
                    SEC-{cat.title.slice(0, 3)}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">{cat.title}</h4>
                  <p className="text-[10px] text-slate-400">{cat.description}</p>
                </div>

                {/* Items */}
                <div className="pt-2 space-y-2">
                  {cat.items && cat.items.length > 0 ? (
                    cat.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-200">
                        <span className="text-slate-500 select-none mt-1">
                          <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                        <p>{item}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">No warnings logged in this category.</div>
                  )}
                </div>
              </div>

              {/* Decorative Subtle Background Glow on Hover */}
              <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-current opacity-0 group-hover:opacity-[0.03] rounded-full blur-xl transition-opacity pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {/* AI Thinking trace log at the footer */}
      {recommendations?.thinkingLog && (
        <div className="p-3 bg-slate-950/45 border border-slate-850 rounded-xl flex items-start gap-2.5">
          <Sparkles className="h-3.5 w-3.5 text-[#C8ABE6] mt-0.5 shrink-0 animate-pulse" />
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Neural Orchestrator Process Log</span>
            <p className="text-[10px] text-slate-400 leading-normal mt-0.5 italic">
              "{recommendations.thinkingLog}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
export default AIRecommendationsPanel;
