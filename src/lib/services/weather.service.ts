interface WeatherData {
  location: string;
  name: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly cityCoordinates = {
    'montreal': { lat: 45.5017, lon: -73.5673, file: 'montreal.json' },
    'new york': { lat: 40.7128, lon: -74.0060, file: 'newyork.json' },
    'paris': { lat: 48.8566, lon: 2.3522, file: 'paris.json' },
    'tokyo': { lat: 35.6762, lon: 139.6503, file: 'tokyo.json' }
  };

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';
  }

  async getWeather(location: string): Promise<WeatherData> {
    if (!this.apiKey) {
      return this.getMockWeather(location);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?q=${encodeURIComponent(location)}&appid=${this.apiKey}`
      );
      
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      return {
        location,
        name: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        feelsLike: Math.round(data.main.feels_like)
      };
    } catch (error) {
      console.warn('API failed, using mock data:', error);
      return this.getMockWeather(location);
    }
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    if (!this.apiKey) {
      return this.getMockWeatherByCoordinates(lat, lon);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}`
      );
      
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      return {
        location: `${lat}, ${lon}`,
        name: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        feelsLike: Math.round(data.main.feels_like)
      };
    } catch (error) {
      console.warn('API failed, using mock data:', error);
      return this.getMockWeatherByCoordinates(lat, lon);
    }
  }

  isMetricLocation(location: string): boolean {
    if (!this.apiKey) {
      const mockData = this.loadMockData(location);
      return mockData.units === 'metric';
    }
    return true; // API uses metric by default
  }

  getDefaultLocation(): string {
    return Object.keys(this.cityCoordinates)[0]; // Returns 'montreal'
  }

  private getMockWeatherByCoordinates(lat: number, lon: number): WeatherData {
    const cityName = this.coordinatesToCityName(lat, lon);
    const mockData = this.loadMockDataByCity(cityName);
    
    return {
      location: `${lat}, ${lon}`,
      name: mockData.name,
      temperature: Math.round(mockData.main.temp),
      description: mockData.weather[0].description,
      humidity: mockData.main.humidity,
      windSpeed: Math.round(mockData.wind.speed),
      feelsLike: Math.round(mockData.main.feels_like)
    };
  }

  private getMockWeather(location: string): WeatherData {
    if (location.includes(',')) {
      const [latStr, lonStr] = location.split(',').map(s => s.trim());
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      if (!isNaN(lat) && !isNaN(lon)) {
        return this.getMockWeatherByCoordinates(lat, lon);
      }
    }
    
    const mockData = this.loadMockData(location);
    return {
      location,
      name: mockData.name,
      temperature: Math.round(mockData.main.temp),
      description: mockData.weather[0].description,
      humidity: mockData.main.humidity,
      windSpeed: Math.round(mockData.wind.speed),
      feelsLike: Math.round(mockData.main.feels_like)
    };
  }

  private coordinatesToCityName(lat: number, lon: number): string {
    for (const [city, coords] of Object.entries(this.cityCoordinates)) {
      if (Math.abs(lat - coords.lat) < 0.1 && Math.abs(lon - coords.lon) < 0.1) {
        return city;
      }
    }
    return 'montreal'; // Default
  }

  private loadMockData(location: string): any {
    const locationLower = location.toLowerCase();
    const cityName = Object.keys(this.cityCoordinates).find(city => 
      locationLower.includes(city)
    );
    
    if (!cityName) {
      throw new Error("I don't have any information available for this location.");
    }
    
    return this.loadMockDataByCity(cityName);
  }

  private loadMockDataByCity(cityName: string): any {
    const cityConfig = this.cityCoordinates[cityName as keyof typeof this.cityCoordinates];
    const fileName = cityConfig?.file || 'montreal.json';
    return require(`./mocks/${fileName}`);
  }
}