import React, { useCallback } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

export interface MapMarkerData {
  id: string;
  name: string;
  type: "gate" | "concession" | "incident";
  lat: number;
  lng: number;
  details: string;
  meta?: any;
}

interface MarkerLayerProps {
  markers: MapMarkerData[];
  onMarkerClick?: (marker: MapMarkerData) => void;
  renderPopupContent?: (marker: MapMarkerData) => React.ReactNode;
}

const iconCache: Record<string, L.DivIcon> = {};

const createCustomIcon = (type: "gate" | "concession" | "incident", severity?: string) => {
  const cacheKey = `${type}-${severity || "none"}`;
  if (iconCache[cacheKey]) {
    return iconCache[cacheKey];
  }

  let colorClass = "bg-[#6EB8E1]";
  let glyph = "G";
  if (type === "concession") {
    colorClass = "bg-amber-500";
    glyph = "C";
  } else if (type === "incident") {
    colorClass = severity === "high" ? "bg-rose-600 animate-pulse" : "bg-orange-500";
    glyph = "!";
  }

  const icon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-slate-950 shadow-md text-white font-bold text-xs ${colorClass}">
        ${glyph}
        <span class="absolute -bottom-1 w-2 h-2 ${colorClass} rotate-45 border-r border-b border-slate-950"></span>
      </div>
    `,
    className: "custom-leaflet-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

  iconCache[cacheKey] = icon;
  return icon;
};

// Internal Memoized Marker to prevent recreating eventHandlers and re-rendering Marker
const MemoizedMarker = React.memo(({ marker, onMarkerClick, renderPopupContent }: { marker: MapMarkerData, onMarkerClick?: (marker: MapMarkerData) => void, renderPopupContent?: (marker: MapMarkerData) => React.ReactNode }) => {
  const severity = marker.meta?.severity;
  const icon = createCustomIcon(marker.type, severity);

  const eventHandlers = React.useMemo(() => ({
    click: () => {
      if (onMarkerClick) {
        onMarkerClick(marker);
      }
    },
  }), [onMarkerClick, marker]);

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={icon}
      eventHandlers={eventHandlers}
    >
      {renderPopupContent && (
        <Popup>
          <div className="text-slate-900 font-sans p-1">
            {renderPopupContent(marker)}
          </div>
        </Popup>
      )}
    </Marker>
  );
});

const MarkerLayer = React.memo(function MarkerLayer({ markers, onMarkerClick, renderPopupContent }: MarkerLayerProps) {
  return (
    <>
      {markers.map((marker) => (
        <MemoizedMarker
          key={`${marker.type}-${marker.id}`}
          marker={marker}
          onMarkerClick={onMarkerClick}
          renderPopupContent={renderPopupContent}
        />
      ))}
    </>
  );
});

export default MarkerLayer;
