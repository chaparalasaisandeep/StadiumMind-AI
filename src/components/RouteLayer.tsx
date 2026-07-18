import React, { useMemo } from "react";
import { Polyline } from "react-leaflet";

interface RouteLayerProps {
  positions: [number, number][];
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
}

const RouteLayer = React.memo(function RouteLayer({
  positions,
  color = "#6EB8E1",
  weight = 4,
  opacity = 0.85,
  dashArray = "6, 6",
}: RouteLayerProps) {
  const pathOptions = useMemo(() => ({
    color,
    weight,
    opacity,
    dashArray,
    lineCap: "round" as const,
    lineJoin: "round" as const,
  }), [color, weight, opacity, dashArray]);

  if (!positions || positions.length === 0) return null;

  return (
    <Polyline
      positions={positions}
      pathOptions={pathOptions}
    />
  );
});

export default RouteLayer;
