import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

interface MapControllerProps {
  center: [number, number];
  zoom?: number;
}

function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [map, center, zoom]);
  return null;
}

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  children?: React.ReactNode;
  className?: string;
}

export default function MapView({ center, zoom = 15, children, className = "h-full w-full" }: MapViewProps) {
  return (
    <div className={`${className} relative overflow-hidden bg-slate-950`} style={{ minHeight: "100%" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={true}
        scrollWheelZoom={true}
        className="h-full w-full outline-none"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapController center={center} zoom={zoom} />
        {children}
      </MapContainer>
    </div>
  );
}
