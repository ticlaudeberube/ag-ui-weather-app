import { WeatherData, OpenWeatherMapResponse } from "../types/weather";
import { LocationService } from "./location.service";
import montrealData from "./mocks/montreal.json";
import newyorkData from "./mocks/newyork.json";
import parisData from "./mocks/paris.json";
import tokyoData from "./mocks/tokyo.json";

export class WeatherService {
  private readonly apiKey: string | undefined;
  private readonly baseUrl = "https://api.openweathermap.org/data/2.5/weather";
  private readonly locationService = new LocationService();
  private readonly cityCoordinates = {
    montreal: { lat: 45.5017, lon: -73.5673, file: "montreal.json" },
    newyork: { lat: 40.7128, lon: -74.006, file: "newyork.json" },
    paris: { lat: 48.8566, lon: 2.3522, file: "paris.json" },
    tokyo: { lat: 35.6762, lon: 139.6503, file: "tokyo.json" },
  };
  private DEFAULT_CITY = Object.keys(this.cityCoordinates)[0];

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || undefined;
  }

  async getWeather(cityName: string): Promise<WeatherData> {
    console.log(
      "🌤️ WeatherService.getWeather called with:",
      cityName,
      "API key:",
      !!this.apiKey,
    );
    console.log("🔧 Debug: Using mock data for:", cityName);
    if (!this.apiKey) {
      return this.getMockWeather(cityName);
    }

    try {
      const locations = this.locationService.getCoordinates(cityName);
      console.log("📍 Coordinates for", cityName, ":", locations);
      const url = `${this.baseUrl}?lat=${locations.lat}&lon=${locations.lon}&appid=${this.apiKey}`;
      console.log("🌐 API URL:", url.replace(this.apiKey!, "[API_KEY]"));
      const response = await fetch(url);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      return {
        coord: this.locationService.getCoordinates(cityName),
        name: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        feelsLike: Math.round(data.main.feels_like),
      };
    } catch (error) {
      console.warn("⚠️ API failed, falling back to mock data:", error);
      return this.getMockWeather(cityName);
    }
  }

  async getWeatherByCoordinates(
    lat: number,
    lon: number,
  ): Promise<WeatherData> {
    if (!this.apiKey) {
      return this.getMockWeatherByCoordinates(lat, lon);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}`,
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      return {
        coord: data.coord,
        name: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        feelsLike: Math.round(data.main.feels_like),
      };
    } catch (error) {
      console.warn("API failed, using mock data:", error);
      return this.getMockWeatherByCoordinates(lat, lon);
    }
  }

  private getMockWeatherByCoordinates(lat: number, lon: number): WeatherData {
    const cityName = this.locationService.coordinatesToCityName(lat, lon);
    const mockData = this.loadMockDataByCity(cityName);

    return {
      coord: mockData.coord,
      name: mockData.name,
      temperature: Math.round(mockData.main.temp),
      description: mockData.weather[0].description,
      humidity: mockData.main.humidity,
      windSpeed: Math.round(mockData.wind.speed),
      feelsLike: Math.round(mockData.main.feels_like),
    };
  }

  private getMockWeather(location: string): WeatherData {
    console.log("getMockWeather called with location:", location);
    if (location.includes(",")) {
      const [latStr, lonStr] = location.split(",").map((s) => s.trim());
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      if (!isNaN(lat) && !isNaN(lon)) {
        return this.getMockWeatherByCoordinates(lat, lon);
      }
    }

    const mockData = this.loadMockData(location);
    console.log(
      "Mock data loaded for",
      location,
      "- temp:",
      mockData.main.temp,
      "name:",
      mockData.name,
    );
    return {
      coord: mockData.coord,
      name: mockData.name,
      temperature: Math.round(mockData.main.temp),
      description: mockData.weather[0].description,
      humidity: mockData.main.humidity,
      windSpeed: Math.round(mockData.wind.speed),
      feelsLike: Math.round(mockData.main.feels_like),
    };
  }

  private loadMockData(location: string): OpenWeatherMapResponse {
    const normalizedLocation = location.toLowerCase().replace(/\s+/g, "");
    console.log("loadMockData - normalized location:", normalizedLocation);
    const cityName = Object.keys(this.cityCoordinates).find(
      (city) =>
        normalizedLocation.includes(city) || city.includes(normalizedLocation),
    );
    console.log("loadMockData - found cityName:", cityName);

    if (!cityName) {
      console.log("loadMockData - no match, using default:", this.DEFAULT_CITY);
      return this.loadMockDataByCity(this.DEFAULT_CITY); // Default fallback
    }

    return this.loadMockDataByCity(cityName);
  }

  private loadMockDataByCity(cityName: string): OpenWeatherMapResponse {
    const mockDataMap: Record<string, OpenWeatherMapResponse> = {
      montreal: montrealData,
      newyork: newyorkData,
      paris: parisData,
      tokyo: tokyoData,
    };
    const normalizedKey = cityName.toLowerCase().replace(/\s+/g, "");
    console.log(
      "loadMockDataByCity - cityName:",
      cityName,
      "normalizedKey:",
      normalizedKey,
    );
    const result = mockDataMap[normalizedKey] || montrealData;
    console.log(
      "loadMockDataByCity - returning data for:",
      result.name,
      "temp:",
      result.main.temp,
    );
    return result;
  }
}
