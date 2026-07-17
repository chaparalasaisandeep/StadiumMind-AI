import { Polyline } from "react-leaflet";

interface IndoorNavigationPlaceholderProps {
  center: [number, number];
  visible?: boolean;
}

export default function IndoorNavigationPlaceholder({ center, visible = true }: IndoorNavigationPlaceholderProps) {
  if (!visible) return null;

  const [baseLat, baseLng] = center;

  // Function to compute relative octagonal rings around the stadium center
  const getRingCoordinates = (radiusOffset: number): [number, number][] => {
    const coords: [number, number][] = [];
    const points = 8;
    for (let i = 0; i <= points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      // Earth radius approximation for simple offsets in meters
      const latOffset = (radiusOffset * Math.sin(angle)) / 111320;
      const lngOffset = (radiusOffset * Math.cos(angle)) / (111320 * Math.cos((baseLat * Math.PI) / 180));
      coords.push([baseLat + latOffset, baseLng + lngOffset]);
    }
    return coords;
  };

  const innerBowl = getRingCoordinates(80);
  const outerBowl = getRingCoordinates(160);

  // Radial walkway connectors representing stadium section access portals
  const radialConnectors = Array.from({ length: 8 }).map((_, idx) => {
    const angle = (idx * 2 * Math.PI) / 8;
    const latOffsetInner = (80 * Math.sin(angle)) / 111320;
    const lngOffsetInner = (80 * Math.cos(angle)) / (111320 * Math.cos((baseLat * Math.PI) / 180));
    const latOffsetOuter = (200 * Math.sin(angle)) / 111320;
    const lngOffsetOuter = (200 * Math.cos(angle)) / (111320 * Math.cos((baseLat * Math.PI) / 180));

    return [
      [baseLat + latOffsetInner, baseLng + lngOffsetInner],
      [baseLat + latOffsetOuter, baseLng + lngOffsetOuter],
    ] as [number, number][];
  });

  // Green football field (pitch) centered at the stadium coordinate
  const pitchCoords: [number, number][] = [
    [baseLat + 0.0003, baseLng - 0.0005],
    [baseLat + 0.0003, baseLng + 0.0005],
    [baseLat - 0.0003, baseLng + 0.0005],
    [baseLat - 0.0003, baseLng - 0.0005],
    [baseLat + 0.0003, baseLng - 0.0005],
  ];

  return (
    <>
      {/* Central Pitch Outline */}
      <Polyline
        positions={pitchCoords}
        pathOptions={{
          color: "#10B981",
          weight: 2,
          opacity: 0.7,
          fillColor: "#10B981",
          fillOpacity: 0.08,
        }}
      />

      {/* Inner Bowl corridor line */}
      <Polyline
        positions={innerBowl}
        pathOptions={{
          color: "#0284C7",
          weight: 1.5,
          opacity: 0.45,
          dashArray: "3, 3",
        }}
      />

      {/* Outer Bowl corridor line */}
      <Polyline
        positions={outerBowl}
        pathOptions={{
          color: "#0284C7",
          weight: 1.5,
          opacity: 0.35,
          dashArray: "3, 3",
        }}
      />

      {/* Walkways and tunnels */}
      {radialConnectors.map((line, idx) => (
        <Polyline
          key={`walkway-${idx}`}
          positions={line}
          pathOptions={{
            color: "#475569",
            weight: 1,
            opacity: 0.4,
          }}
        />
      ))}
    </>
  );
}
