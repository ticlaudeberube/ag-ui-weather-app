# Weather Service Documentation

## Overview

The WeatherService provides weather data through OpenWeatherMap API with automatic fallback to mock data from JSON files.

## Configuration

### Environment Variables

```bash
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-api-key-here
```

### Behavior

- **With API key**: Uses OpenWeatherMap API, falls back to mock data on errors
- **Without API key**: Uses mock data exclusively

## API Methods

### `getWeather(location: string): Promise<WeatherData>`

Gets weather by city name or coordinates string.

```typescript
const weather = await weatherService.getWeather("Montreal");
const weather = await weatherService.getWeather("45.5017, -73.5673");
```

### `getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData>`

Gets weather by latitude and longitude.

```typescript
const weather = await weatherService.getWeatherByCoordinates(45.5017, -73.5673);
```

## Mock Data

### Supported Cities

- **Montreal**: `45.5017, -73.5673` → `montreal.json`
- **New York**: `40.7128, -74.0060` → `newyork.json`
- **Paris**: `48.8566, 2.3522` → `paris.json`
- **Tokyo**: `35.6762, 139.6503` → `tokyo.json`

### Coordinate Mapping

Coordinates within 0.1 degrees of city coordinates map to corresponding mock data.

### Mock File Structure

```json
{
  "name": "City Name",
  "units": "metric|imperial",
  "main": {
    "temp": 21.0,
    "feels_like": 22.0,
    "humidity": 45
  },
  "weather": [
    {
      "description": "clear sky"
    }
  ],
  "wind": {
    "speed": 5.0
  }
}
```

## WeatherData Interface

```typescript
interface WeatherData {
  location: string; // Input location or coordinates
  name: string; // City name
  temperature: number; // Temperature (rounded)
  description: string; // Weather description
  humidity: number; // Humidity percentage
  windSpeed: number; // Wind speed (rounded)
  feelsLike: number; // Feels like temperature (rounded)
}
```

## Error Handling

- API failures automatically fall back to mock data
- Invalid coordinates default to Montreal mock data
- Unknown cities default to Montreal mock data
