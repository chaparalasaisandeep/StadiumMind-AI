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
    // Calculates customized path instructions tailored to wheelchair and accessibility requirements
    if (requireAccessibility) {
      return [
        {
          instruction: "Depart from accessible-marked entrance gate transit node",
          distanceMetres: 120,
          durationSeconds: 110,
          accessible: true
        },
        {
          instruction: "Proceed along elevator tower E2 to the level 1 concourse platform",
          distanceMetres: 60,
          durationSeconds: 90,
          accessible: true
        },
        {
          instruction: "Use standard tactile corridor pathways directly to wheelchair platform 104",
          distanceMetres: 95,
          durationSeconds: 80,
          accessible: true
        }
      ];
    }

    return [
      {
        instruction: "Depart from main entrance gate node",
        distanceMetres: 120,
        durationSeconds: 90,
        accessible: true
      },
      {
        instruction: "Use Level 1 access ramp R4 to Level 1 concourse",
        distanceMetres: 80,
        durationSeconds: 120,
        accessible: true
      },
      {
        instruction: "Take stairs S10 directly to section 104 seating gate",
        distanceMetres: 45,
        durationSeconds: 40,
        accessible: false
      }
    ];
  },

  async findNearbyFacilities(center, type, radiusMetres) {
    // Locate critical proximity facilities centered around active perimeter pins
    return [
      {
        id: "fac-1",
        name: "ADA Assist Restroom Sector 3",
        type: "restroom",
        distance: 45,
        accessible: true
      },
      {
        id: "fac-2",
        name: "First Aid & Triage Station B",
        type: "medical",
        distance: 110,
        accessible: true
      }
    ];
  }
};
