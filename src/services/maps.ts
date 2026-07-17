export interface LocationCoordinate {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  instruction: string;
  distanceMetres: number;
  durationSeconds: number;
  accessible: boolean;
}

export interface MapsService {
  /**
   * Pans map and calculates a secure, accessible spectator path between stadium gates & seating
   */
  calculateRoute(from: LocationCoordinate, to: LocationCoordinate, requireAccessibility: boolean): Promise<RouteSegment[]>;

  /**
   * Searches for nearby points of interest (concessions, restrooms, medical stations) within radius
   */
  findNearbyFacilities(center: LocationCoordinate, type: string, radiusMetres: number): Promise<any[]>;
}

export const mapsService: MapsService = {
  async calculateRoute(from, to, requireAccessibility) {
    // TODO: Integrate dynamic routing calculations with OSM.
    console.log("mapsService.calculateRoute placeholder triggered", { from, to, requireAccessibility });
    return [
      {
        instruction: "Depart from main entrance gate node",
        distanceMetres: 120,
        durationSeconds: 90,
        accessible: true
      },
      {
        instruction: "Use accessible ramp R4 to Level 1 concourse",
        distanceMetres: 80,
        durationSeconds: 120,
        accessible: true
      }
    ];
  },

  async findNearbyFacilities(center, type, radiusMetres) {
    // TODO: Integrate nearby stadium facility searches via local DB.
    console.log("mapsService.findNearbyFacilities placeholder triggered", { center, type, radiusMetres });
    return [];
  }
};
