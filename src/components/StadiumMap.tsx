import { useState, useEffect, useMemo } from "react";
import { StadiumLocation, StadiumState } from "../types";
import { AlertCircle, Navigation, ShoppingBag, ShieldAlert, CheckCircle, Map as MapIcon, Layers, Compass } from "lucide-react";
import MapView from "./MapView";
import MarkerLayer, { MapMarkerData } from "./MarkerLayer";
import RouteLayer from "./RouteLayer";
import HeatmapPlaceholder from "./HeatmapPlaceholder";
import IndoorNavigationPlaceholder from "./IndoorNavigationPlaceholder";

interface StadiumMapProps {
  stadium: StadiumLocation;
  stadiumState: StadiumState;
  onSelectIncident?: (incidentId: string) => void;
}

export default function StadiumMap({ stadium, stadiumState, onSelectIncident }: StadiumMapProps) {
  const [selectedPin, setSelectedPin] = useState<MapMarkerData | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showIndoor, setShowIndoor] = useState(true);
  const [routePositions, setRoutePositions] = useState<[number, number][]>([]);

  const baseLat = stadium.lat;
  const baseLng = stadium.lng;

  // Clear selections when stadium changes
  useEffect(() => {
    setSelectedPin(null);
    setRoutePositions([]);
  }, [stadium]);

  // Generate a route from the stadium center to the selected pin
  useEffect(() => {
    if (selectedPin) {
      // Build a routed path with intermediate routing nodes to make it look realistic
      const midLat = baseLat + (selectedPin.lat - baseLat) * 0.4;
      const midLng = baseLng + (selectedPin.lng - baseLng) * 0.7;
      setRoutePositions([
        [baseLat, baseLng],
        [midLat, midLng],
        [selectedPin.lat, selectedPin.lng]
      ]);
    } else {
      setRoutePositions([]);
    }
  }, [selectedPin, baseLat, baseLng]);

  // Pre-generate localized coordinates around the active stadium
  const gateMarkers = useMemo(() => {
    return stadiumState.activeGates.map((gate, idx) => {
      const offsetLat = idx === 0 ? 0.001 : idx === 1 ? -0.001 : idx === 2 ? 0.0005 : -0.0008;
      const offsetLng = idx === 0 ? -0.0012 : idx === 1 ? 0.0012 : idx === 2 ? 0.0014 : -0.0014;
      return {
        id: gate.id,
        name: gate.name,
        type: "gate" as const,
        lat: baseLat + offsetLat,
        lng: baseLng + offsetLng,
        details: `Flow: ${gate.flowRate} fans/min. Pressure: ${gate.pressure.toUpperCase()}. Status: ${gate.status.toUpperCase()}`,
        meta: gate
      };
    });
  }, [stadiumState.activeGates, baseLat, baseLng]);

  const concessionMarkers = useMemo(() => {
    return stadiumState.concessions.map((conc, idx) => {
      const offsetLat = idx === 0 ? 0.0003 : idx === 1 ? -0.0004 : idx === 2 ? 0.0007 : idx === 3 ? -0.0007 : 0.0002;
      const offsetLng = idx === 0 ? -0.0003 : idx === 1 ? 0.0004 : idx === 2 ? -0.0007 : idx === 3 ? 0.0007 : 0.0009;
      return {
        id: conc.id,
        name: conc.name,
        type: "concession" as const,
        lat: baseLat + offsetLat,
        lng: baseLng + offsetLng,
        details: `Section ${conc.section} // Waiting Time: ${conc.queueTime} mins (${conc.status.toUpperCase()})`,
        meta: conc
      };
    });
  }, [stadiumState.concessions, baseLat, baseLng]);

  const incidentMarkers = useMemo(() => {
    return stadiumState.incidents.map((inc) => {
      const isMetlife = stadium.id === "metlife";
      const markerLat = isMetlife ? inc.lat : baseLat + (inc.lat - 40.8128);
      const markerLng = isMetlife ? inc.lng : baseLng + (inc.lng - (-74.0742));
      return {
        id: inc.id,
        name: inc.title,
        type: "incident" as const,
        lat: markerLat,
        lng: markerLng,
        details: `Type: ${inc.type.toUpperCase()} // Status: ${inc.status.toUpperCase()} // Severity: ${inc.severity.toUpperCase()}`,
        meta: inc
      };
    });
  }, [stadiumState.incidents, stadium.id, baseLat, baseLng]);

  const allMarkers = useMemo(() => {
    return [...gateMarkers, ...concessionMarkers, ...incidentMarkers];
  }, [gateMarkers, concessionMarkers, incidentMarkers]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[450px] shadow-xl relative flex flex-col md:flex-row">
      {/* Side Control Overlay Panel */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-lg text-[11px] backdrop-blur-md w-[220px] pointer-events-auto">
        <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-[#6EB8E1]" />
          Perimeter OSM Radar
        </h4>

        {/* Legend */}
        <div className="space-y-1.5 text-slate-400 mb-3 border-b border-slate-800 pb-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#6EB8E1]"></span>
              <span>Gates</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">{gateMarkers.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
              <span>Concessions</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">{concessionMarkers.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              <span>Incidents</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">{incidentMarkers.length}</span>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="space-y-2">
          <h5 className="font-medium text-slate-300 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Layers className="h-3 w-3" /> Overlays
          </h5>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-[#6EB8E1] focus:ring-0 focus:ring-offset-0 h-3 w-3 cursor-pointer"
            />
            <span>Crowd Density Heatmap</span>
          </label>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showIndoor}
              onChange={(e) => setShowIndoor(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-[#6EB8E1] focus:ring-0 focus:ring-offset-0 h-3 w-3 cursor-pointer"
            />
            <span>Indoor Concourse Map</span>
          </label>
        </div>
      </div>

      {/* Map Content View Container */}
      <div className="flex-1 h-full w-full relative z-0">
        <MapView center={[baseLat, baseLng]} zoom={15}>
          {/* Heatmap Layer */}
          <HeatmapPlaceholder center={[baseLat, baseLng]} visible={showHeatmap} />

          {/* Indoor Navigation Layout */}
          <IndoorNavigationPlaceholder center={[baseLat, baseLng]} visible={showIndoor} />

          {/* Connected Routing Pathway Layer */}
          {routePositions.length > 0 && (
            <RouteLayer positions={routePositions} color="#38BDF8" weight={3.5} />
          )}

          {/* Interactive Marker Pins */}
          <MarkerLayer
            markers={allMarkers}
            onMarkerClick={(marker) => setSelectedPin(marker)}
            renderPopupContent={(marker) => (
              <div className="p-1 max-w-[220px] font-sans">
                <div className="flex items-center gap-1.5 mb-1.5 border-b border-slate-100 pb-1">
                  {marker.type === "incident" ? (
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                  ) : marker.type === "concession" ? (
                    <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                  ) : (
                    <Compass className="h-3.5 w-3.5 text-[#0284C7]" />
                  )}
                  <h4 className="text-xs font-bold text-slate-900 truncate">{marker.name}</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal mb-1">{marker.details}</p>
                {marker.type === "incident" && marker.meta?.status === "reported" && onSelectIncident && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIncident(marker.id);
                      setSelectedPin(null);
                    }}
                    className="mt-2 w-full bg-slate-900 text-white font-semibold rounded py-1 text-[10px] hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" /> Dispatch Responders
                  </button>
                )}
              </div>
            )}
          />
        </MapView>
      </div>
    </div>
  );
}
