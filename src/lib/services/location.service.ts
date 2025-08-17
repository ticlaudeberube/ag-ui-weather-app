interface CityCoordinates {
  [key: string]: { lat: number; lon: number };
}

export class LocationService {
  private readonly cityCoordinates: CityCoordinates = {
    Montreal: { lat: 45.5017, lon: -73.5673 },
    "New York": { lat: 40.7128, lon: -74.006 },
    Paris: { lat: 48.8566, lon: 2.3522 },
    Tokyo: { lat: 35.6762, lon: 139.6503 },
  };

  getCityName(lat: number, lon: number): string {
    for (const [city, coords] of Object.entries(this.cityCoordinates)) {
      if (
        Math.abs(lat - coords.lat) < 0.01 &&
        Math.abs(lon - coords.lon) < 0.01
      ) {
        console.log(city);
        return city;
      }
    }
    return this.getDefaultLocation();
  }

  coordinatesToCityName(lat: number, lon: number): string {
    return this.getCityName(lat, lon);
  }

  getDefaultLocation(): string {
    return Object.keys(this.cityCoordinates)[0]; // Returns 'montreal'
  }

  getCoordinates(city: string): { lat: number; lon: number } {
    const coords = this.cityCoordinates[city];
    if (!coords) {
      return this.cityCoordinates[this.getDefaultLocation()];
    }
    return coords;
  }
  formatCityCoordinates(city: string): string {
    const coords = this.cityCoordinates[city];
    if (!coords) {
      return "";
    }
    return `${city}: ${coords.lat}, ${coords.lon}`;
  }
}
