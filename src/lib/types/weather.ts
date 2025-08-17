export interface WeatherData {
  coord: { lon: number; lat: number };
  name: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

export interface OpenWeatherMapResponse {
  name: string;
  units?: string;
  coord: { lon: number; lat: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
}
