/// <reference types="jest" />
import { WeatherService } from "../lib/services/weather.service";

// Mock fetch globally
global.fetch = jest.fn();

describe("WeatherService", () => {
  let weatherService: WeatherService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    weatherService = new WeatherService();
    jest.clearAllMocks();
  });

  test("should get weather for New York with mock data", async () => {
    const result = await weatherService.getWeather("New York");

    expect(result).toEqual({
      coord: { lat: 40.7128, lon: -74.006 },
      name: "New York",
      temperature: 70,
      description: "few clouds",
      humidity: 55,
      windSpeed: 8,
      feelsLike: 72,
    });
  });

  test("should get weather by coordinates for NYC", async () => {
    const result = await weatherService.getWeatherByCoordinates(
      40.7128,
      -74.006,
    );

    expect(result).toEqual({
      coord: { lat: 40.7128, lon: -74.006 },
      name: "New York",
      temperature: 70,
      description: "few clouds",
      humidity: 55,
      windSpeed: 8,
      feelsLike: 72,
    });
  });

  test("should fallback to mock data when API fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API Error"));

    const result = await weatherService.getWeather("New York");

    expect(result).toEqual({
      coord: { lat: 40.7128, lon: -74.006 },
      name: "New York",
      temperature: 70,
      description: "few clouds",
      humidity: 55,
      windSpeed: 8,
      feelsLike: 72,
    });
  });

  test("should handle coordinate string input", async () => {
    const result = await weatherService.getWeather("40.7128, -74.0060");

    expect(result.coord).toEqual({ lat: 40.7128, lon: -74.006 });
    expect(result.name).toBe("New York");
  });

  test("should handle unknown location", async () => {
    const result = await weatherService.getWeather("UnknownCity");
    expect(result.name).toBe("Montreal"); // Falls back to default city
  });

  test("should handle API error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const result = await weatherService.getWeather("New York");
    expect(result.name).toBe("New York"); // Falls back to mock
  });

  test("should handle coordinates API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const result = await weatherService.getWeatherByCoordinates(
      40.7128,
      -74.006,
    );
    expect(result.name).toBe("New York"); // Falls back to mock
  });

  test("should handle unknown coordinates", async () => {
    const result = await weatherService.getWeatherByCoordinates(0, 0);
    expect(result.name).toBe("Montreal"); // Default fallback
  });

  test("should use API when key is available", async () => {
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY = "test-key";
    const weatherServiceWithKey = new WeatherService();

    const mockData = {
      name: "Paris",
      main: { temp: 15, feels_like: 17, humidity: 60 },
      weather: [{ description: "cloudy" }],
      wind: { speed: 5 },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await weatherServiceWithKey.getWeather("Paris");
    expect(result.temperature).toBe(15);

    delete process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  });

  test("should use API for coordinates when key is available", async () => {
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY = "test-key";
    const weatherServiceWithKey = new WeatherService();

    const mockData = {
      name: "Tokyo",
      main: { temp: 25, feels_like: 27, humidity: 70 },
      weather: [{ description: "sunny" }],
      wind: { speed: 3 },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await weatherServiceWithKey.getWeatherByCoordinates(
      35.6762,
      139.6503,
    );
    expect(result.temperature).toBe(25);

    delete process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  });
});
