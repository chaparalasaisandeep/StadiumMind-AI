import { Polyline } from "react-leaflet";

interface RouteLayerProps {
  positions: [number, number][];
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
}

export default function RouteLayer({
  positions,
  color = "#6EB8E1",
  weight = 4,
  opacity = 0.85,
  dashArray = "6, 6",
}: RouteLayerProps) {
  if (!positions || positions.length === 0) return null;

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color,
        weight,
        opacity,
        dashArray,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}
