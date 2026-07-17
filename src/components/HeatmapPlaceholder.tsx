import { Circle } from "react-leaflet";

interface HeatmapPlaceholderProps {
  center: [number, number];
  visible?: boolean;
}

export default function HeatmapPlaceholder({ center, visible = true }: HeatmapPlaceholderProps) {
  if (!visible) return null;

  const [baseLat, baseLng] = center;

  // Relative offsets around the stadium center to position heatmap hotspots
  const hotspots = [
    { latOffset: 0.0012, lngOffset: -0.0012, radius: 140, intensity: "high" as const },
    { latOffset: -0.0008, lngOffset: 0.0014, radius: 110, intensity: "medium" as const },
    { latOffset: 0.0003, lngOffset: -0.0003, radius: 80, intensity: "high" as const },
    { latOffset: -0.0007, lngOffset: -0.0007, radius: 95, intensity: "low" as const },
  ];

  return (
    <>
      {hotspots.map((spot, idx) => {
        const spotLat = baseLat + spot.latOffset;
        const spotLng = baseLng + spot.lngOffset;

        let fillColor = "#EF4444"; // high
        let fillOpacity = 0.4;

        if (spot.intensity === "medium") {
          fillColor = "#F59E0B";
          fillOpacity = 0.3;
        } else if (spot.intensity === "low") {
          fillColor = "#10B981";
          fillOpacity = 0.2;
        }

        return (
          <Circle
            key={`heatmap-spot-${idx}`}
            center={[spotLat, spotLng]}
            radius={spot.radius}
            pathOptions={{
              fillColor,
              fillOpacity,
              color: "transparent",
              stroke: false,
            }}
          />
        );
      })}
    </>
  );
}
