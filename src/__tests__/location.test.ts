/// <reference types="jest" />

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

// Mock fetch for reverse geocoding
global.fetch = jest.fn();

describe('Current Location Tests', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get Montreal as current location', async () => {
    // Mock Montreal coordinates (45.5017, -73.5673)
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: {
          latitude: 45.5017,
          longitude: -73.5673
        }
      });
    });

    // Mock reverse geocoding response for Montreal
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: 'Montreal' }]
    } as Response);

    // Simulate getCurrentLocation action
    const getCurrentLocation = async () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=test-key`
            );
            
            if (response.ok) {
              const data = await response.json();
              const cityName = data[0]?.name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
              resolve({ location: cityName });
            }
          },
          reject
        );
      });
    };

    const result = await getCurrentLocation();
    expect(result).toEqual({ location: 'Montreal' });
  });

  test('should get New York from NYC coordinates', async () => {
    // Mock NYC coordinates (40.7128, -74.0060)
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      });
    });

    // Mock reverse geocoding response for NYC
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: 'New York' }]
    } as Response);

    const getCurrentLocation = async () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=test-key`
            );
            
            if (response.ok) {
              const data = await response.json();
              const cityName = data[0]?.name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
              resolve({ location: cityName });
            }
          },
          reject
        );
      });
    };

    const result = await getCurrentLocation();
    expect(result).toEqual({ location: 'New York' });
  });
});