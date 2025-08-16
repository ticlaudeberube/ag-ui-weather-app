/// <reference types="jest" />
import { WeatherService } from '../lib/services/weather.service';

// Mock fetch globally
global.fetch = jest.fn();

describe('WeatherService', () => {
  let weatherService: WeatherService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    weatherService = new WeatherService();
    jest.clearAllMocks();
  });

  test('should get weather for New York with mock data', async () => {
    const result = await weatherService.getWeather('New York');

    expect(result).toEqual({
      location: 'New York',
      name: 'New York',
      temperature: 70,
      description: 'few clouds',
      humidity: 55,
      windSpeed: 8,
      feelsLike: 72
    });
  });

  test('should get weather by coordinates for NYC', async () => {
    const result = await weatherService.getWeatherByCoordinates(40.7128, -74.0060);

    expect(result).toEqual({
      location: '40.7128, -74.006',
      name: 'New York',
      temperature: 70,
      description: 'few clouds',
      humidity: 55,
      windSpeed: 8,
      feelsLike: 72
    });
  });

  test('should fallback to mock data when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    const result = await weatherService.getWeather('New York');

    expect(result).toEqual({
      location: 'New York',
      name: 'New York',
      temperature: 70,
      description: 'few clouds',
      humidity: 55,
      windSpeed: 8,
      feelsLike: 72
    });
  });
});