"use client";

import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";
import { useState, useEffect } from "react";
import { WeatherService } from "../lib/services/weather.service";

export default function CopilotKitPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  // 🪁 Frontend Actions: https://docs.copilotkit.ai/guides/frontend-actions
  useCopilotAction({
    name: "setThemeColor",
    description: "Set the theme color of the page.",
    parameters: [{
      name: "themeColor",
      description: "The theme color to set. Make sure to pick nice colors.",
      required: true, 
    }],
    handler({ themeColor }) {
      setThemeColor(themeColor);
    },
  });

  return (
    <main style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}>
      <YourMainContent themeColor={themeColor} />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "🌤️ WeatherBot",
          initial: "👋 Hello! I'm WeatherBot, your friendly AI weather forecaster!\n\nI can help you with:\n- **Current Weather**: \"What's the weather in New York?\"\n- **Your Location**: \"What's the weather at my current location?\"\n- **Planning Advice**: \"Should I bring an umbrella today?\"\n- **Multiple Locations**: \"Compare weather in Paris and London\"\n- **Theme Colors**: \"Set the theme to sky blue\"\n\nJust ask me about any location and I'll give you detailed weather info with helpful tips for your day!"
        }}
      />
    </main>
  );
}

// State of the agent, make sure this aligns with your agent's state.
type AgentState = {
  lastLocation: string;
}

function YourMainContent({ themeColor }: { themeColor: string }) {
  const [debugCoords, setDebugCoords] = useState<{lat: number, lon: number} | null>(null);
  const weatherService = new WeatherService();
  const DEFAULT_LOCATION = weatherService.getDefaultLocation();
  
  const setLocationSafely = (location: string) => {
    setState({...state, lastLocation: location || DEFAULT_LOCATION});
  };
  
  // 🪁 Shared State: https://docs.copilotkit.ai/coagents/shared-state
  const {state, setState} = useCoAgent<AgentState>({
    name: "weatherAgent",
    initialState: {
      lastLocation: "Getting location...",
    },
  })

  // Get initial location using weather service directly
  useEffect(() => {
    const getInitialLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const weatherService = new WeatherService();
              const weather = await weatherService.getWeatherByCoordinates(latitude, longitude);
              console.log(weather)
              setState({...state, lastLocation: weather.name});
            } catch (error) {
              setState({...state, lastLocation: 'Location service error'});
            }
          },
          () => setState({...state, lastLocation: 'Geolocation denied'}),
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
        );
      } else {
        setState({...state, lastLocation: 'Geolocation not supported'});
      }
    };
    
    getInitialLocation();
  }, []);

  // 🪁 Frontend Actions: https://docs.copilotkit.ai/coagents/frontend-actions
  useCopilotAction({
    name: "updateLocationDisplay",
    description: "Update location display.",
    parameters: [{ name: "location", type: "string", required: true }],
    handler: ({ location }) => setState({ ...state, lastLocation: location }),
  });

  useCopilotAction({
    name: "getWeatherByCoordinates",
    description: "Get weather and city name from coordinates using weather service.",
    parameters: [
      { name: "latitude", type: "number", required: true },
      { name: "longitude", type: "number", required: true }
    ],
    handler: async ({ latitude, longitude }) => {
      // This will be handled by the agent's weather service
      return { latitude, longitude };
    },
  });

  useCopilotAction({
    name: "getCurrentLocation",
    description: "Get the user's current GPS coordinates. Returns latitude and longitude.",
    parameters: [],
    handler: async () => {
      // Use debug coordinates if set
      if (debugCoords) {
        return { latitude: debugCoords.lat, longitude: debugCoords.lon };
      }

      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser.');
      }

      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            reject(new Error(`Location error: ${error.message}`));
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
        );
      });
    },
  });

  //🪁 Generative UI: https://docs.copilotkit.ai/coagents/generative-ui
  useCopilotAction({
    name: "displayWeatherCard",
    description: "Display weather card with weather data.",
    parameters: [
      { name: "location", type: "string", required: true },
      { name: "temperature", type: "number", required: false },
      { name: "description", type: "string", required: false },
      { name: "humidity", type: "number", required: false },
      { name: "windSpeed", type: "number", required: false },
      { name: "feelsLike", type: "number", required: false },
    ],
    render: ({ args }) => {
      return <WeatherCard 
        location={args.location} 
        temperature={args.temperature}
        description={args.description}
        humidity={args.humidity}
        windSpeed={args.windSpeed}
        feelsLike={args.feelsLike}
        themeColor={themeColor} 
      />
    },
  });

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="h-screen w-screen flex justify-center items-center flex-col transition-colors duration-300"
    >
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">🌤️ WeatherBot</h1>
        <p className="text-gray-200 text-center italic mb-6">Your AI Weather Forecaster - Ask me about weather anywhere! 🌍</p>
        <hr className="border-white/20 my-6" />
        <div className="text-center">
          <div className="bg-white/15 p-6 rounded-xl text-white">
            <h3 className="text-xl font-semibold mb-2">Current Location</h3>
            <p className="text-2xl font-bold">{state.lastLocation}</p>
            <p className="text-sm text-gray-200 mt-2">Ask me about weather here or anywhere else!</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-white font-medium">Try asking:</p>
              <p className="text-gray-200 text-sm">"What's the weather like?"</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-white font-medium">Or specify:</p>
              <p className="text-gray-200 text-sm">"Weather in Montreal"</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-white/10 p-4 rounded-lg text-center">
              <p className="text-white font-medium mb-1">📍 Current Location</p>
              <p className="text-gray-200 text-sm">"What's the weather at my current location?"</p>
            </div>
          </div>
          
          {/* Debug Coordinates Override */}
          <div className="mt-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white font-medium mb-2">🔧 Debug Mode</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button 
                  onClick={() => {
                    setDebugCoords({lat: 40.7128, lon: -74.0060});
                    setState({...state, lastLocation: 'New York'});
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                >
                  NYC
                </button>
                <button 
                  onClick={() => {
                    setDebugCoords({lat: 48.8566, lon: 2.3522});
                    setState({...state, lastLocation: 'Paris'});
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                >
                  Paris
                </button>
                <button 
                  onClick={() => {
                    setDebugCoords({lat: 35.6762, lon: 139.6503});
                    setState({...state, lastLocation: 'Tokyo'});
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1 rounded"
                >
                  Tokyo
                </button>
              </div>
              <button 
                onClick={() => {
                  setDebugCoords(null);
                  const resetLocation = async (lat: number, lon: number) => {
                    try {
                      const weatherService = new WeatherService();
                      const weather = await weatherService.getWeatherByCoordinates(lat, lon);
                      setLocationSafely(weather.name);
                    } catch {
                      setLocationSafely(DEFAULT_LOCATION);
                    }
                  };
                  
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => resetLocation(pos.coords.latitude, pos.coords.longitude),
                      () => setLocationSafely(DEFAULT_LOCATION)
                    );
                  } else {
                    setLocationSafely(DEFAULT_LOCATION);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded w-full"
              >
                Reset to Real Location
              </button>
              {debugCoords && (
                <p className="text-gray-300 text-xs mt-1">
                  Override: {debugCoords.lat === 40.7128 ? 'New York' : 
                           debugCoords.lat === 48.8566 ? 'Paris' : 
                           debugCoords.lat === 35.6762 ? 'Tokyo' : 
                           `${debugCoords.lat.toFixed(2)}, ${debugCoords.lon.toFixed(2)}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple sun icon for the weather card
function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-yellow-200">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" stroke="currentColor" />
    </svg>
  );
}

// Weather card component with real weather data
function WeatherCard({ 
  location, 
  temperature, 
  description, 
  humidity, 
  windSpeed, 
  feelsLike, 
  themeColor 
}: { 
  location?: string;
  temperature?: number;
  description?: string;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
  themeColor: string;
}) {
  return (
    <div
    style={{ backgroundColor: themeColor }}
    className="rounded-xl shadow-xl mt-6 mb-4 max-w-md w-full"
  >
    <div className="bg-white/20 p-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white capitalize">Current Weather in {location}</h3>
        </div>
        <SunIcon />
      </div>
      
      <div className="mt-4 flex items-end justify-between">
        <div className="text-3xl font-bold text-white">{temperature || 70}°</div>
        <div className="text-sm text-white capitalize">{description || 'Clear skies'}</div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-white text-xs">Humidity</p>
            <p className="text-white font-medium">{humidity || 45}%</p>
          </div>
          <div>
            <p className="text-white text-xs">Wind</p>
            <p className="text-white font-medium">{windSpeed || 5} mph</p>
          </div>
          <div>
            <p className="text-white text-xs">Feels Like</p>
            <p className="text-white font-medium">{feelsLike || 72}°</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
