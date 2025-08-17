"use client";

import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";
import { useEffect, useState } from "react";
import { LocationService } from "../lib/services/location.service";
import { WeatherService } from "../lib/services/weather.service";

// Sanitize user input to prevent XSS
const sanitizeText = (text: string | number | undefined): string => {
  if (text === undefined || text === null) return "";
  return String(text).replace(/[<>"'&]/g, (match) => {
    const escapeMap: { [key: string]: string } = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "&": "&amp;",
    };
    return escapeMap[match] || match;
  });
};

export default function CopilotKitPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  // 🪁 Frontend Actions: https://docs.copilotkit.ai/guides/frontend-actions
  useCopilotAction({
    name: "setThemeColor",
    description: "Set the theme color of the page.",
    parameters: [
      {
        name: "themeColor",
        type: "string",
        description: "The theme color to set. Make sure to pick nice colors.",
        required: true,
      },
    ],
    handler({ themeColor }) {
      setThemeColor(themeColor);
    },
  });

  // TODO:
  // "**Planning Advice**: \"Should I bring an umbrella today?\"\n- **Multiple Locations**: \"Compare weather in Paris and London(TBD)\"\n-Just ask me about any location and I'll give you detailed weather info with helpful tips for your day!"

  return (
    <main
      style={
        { "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties
      }
    >
      <YourMainContent themeColor={themeColor} />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "🌤️ WeatherBot",
          initial:
            '👋 Hello! I\'m WeatherBot, your friendly AI weather forecaster!\n\nI can help you with:\n- **Current Weather**: "What\'s the weather in New York?"\n- **Your Location**: "What\'s the weather at my current location?" ',
        }}
      />
    </main>
  );
}

// State of the agent, make sure this aligns with your agent's state.
type AgentState = {
  cityName: string;
};

function YourMainContent({ themeColor }: { themeColor: string }) {
  const locationService = new LocationService();
  const DEFAULT_LOCATION = locationService.getDefaultLocation();

  // UI-only state (agent cannot modify this)
  const [uiLocation, setUiLocation] = useState(DEFAULT_LOCATION);

  // Agent state (for agent internal use only)
  const { state: agentState } = useCoAgent<AgentState>({
    name: "weatherAgent",
    initialState: {
      cityName: DEFAULT_LOCATION,
    },
  });

  const setLocationSafely = (location?: string) => {
    setUiLocation(location || DEFAULT_LOCATION);
  };

  // Get initial location using weather service directly (only once on mount)
  useEffect(() => {
    const getInitialLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const weatherService = new WeatherService();
              const weather = await weatherService.getWeatherByCoordinates(
                latitude,
                longitude,
              );
              // console.log('Weather data received for coordinates')
              // console.log('Geolocation setting cityName to:', weather.name);
              setLocationSafely(sanitizeText(weather.name));
            } catch {
              console.log("Location service error");
              setLocationSafely();
            }
          },
          () => setLocationSafely(),
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 },
        );
      } else {
        console.log("Geolocation not supported");
        setLocationSafely();
      }
    };

    getInitialLocation();
  }, [setLocationSafely]); // Include setLocationSafely dependency

  // 🪁 Frontend Actions: https://docs.copilotkit.ai/coagents/frontend-actions

  useCopilotAction({
    name: "getWeatherByCoordinates",
    description:
      "Get weather and city name from coordinates using weather service.",
    parameters: [
      { name: "latitude", type: "number", required: true },
      { name: "longitude", type: "number", required: true },
    ],
    handler: async ({ latitude, longitude }) => {
      // This will be handled by the agent's weather service
      return { latitude, longitude };
    },
  });

  useCopilotAction({
    name: "getSelectedCity",
    description:
      "Get the currently selected city from frontend state (read-only)",
    parameters: [],
    handler: async () => {
      console.log("getSelectedCity called - uiLocation:", uiLocation);
      return uiLocation || DEFAULT_LOCATION;
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
      return (
        <WeatherCard
          location={args.location}
          temperature={args.temperature}
          description={args.description}
          humidity={args.humidity}
          windSpeed={args.windSpeed}
          feelsLike={args.feelsLike}
          themeColor={themeColor}
        />
      );
    },
  });

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="h-screen w-screen flex justify-center items-center flex-col transition-colors duration-300"
    >
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          🌤️ WeatherBot
        </h1>
        <p className="text-gray-200 text-center italic mb-6">
          Your AI Weather Forecaster - Ask me about weather anywhere! 🌍
        </p>
        <hr className="border-white/20 my-6" />
        <div className="text-center">
          <div className="bg-white/15 p-6 rounded-xl text-white">
            <h3 className="text-xl font-semibold mb-2">Current Location</h3>
            <p className="text-2xl font-bold">{uiLocation}</p>
            <p className="text-sm text-gray-200 mt-2">
              Ask me about weather here or anywhere else!
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-white font-medium">Try asking:</p>
              <p className="text-gray-200 text-sm">
                {"What's the weather like?"}
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-white font-medium">Or specify:</p>
              <p className="text-gray-200 text-sm">{"Weather in Montreal"}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-white/10 p-4 rounded-lg text-center">
              <p className="text-white font-medium mb-1">📍 Current Location</p>
              <p className="text-gray-200 text-sm">
                {"What's the weather at my current location?"}
              </p>
            </div>
          </div>

          {/* Debug Coordinates Override */}
          <div className="mt-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white font-medium mb-2">🔧 Debug Mode</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  onClick={() => {
                    setLocationSafely("New York");
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                >
                  NYC
                </button>
                <button
                  onClick={() => {
                    setLocationSafely("Paris");
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                >
                  Paris
                </button>
                <button
                  onClick={() => {
                    setLocationSafely("Tokyo");
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1 rounded"
                >
                  Tokyo
                </button>
              </div>
              <button
                onClick={() => {
                  console.log(
                    "Reset button clicked, setting to:",
                    DEFAULT_LOCATION,
                  );
                  setLocationSafely(DEFAULT_LOCATION);
                }}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded w-full"
              >
                Reset to Real Location
              </button>
              {agentState.cityName !== DEFAULT_LOCATION && (
                <p className="text-gray-300 text-xs mt-1">
                  Override:{" "}
                  {agentState.cityName === "New York"
                    ? `${locationService.formatCityCoordinates("New York")}`
                    : agentState.cityName === "Paris"
                      ? `${locationService.formatCityCoordinates("Paris")}`
                      : agentState.cityName === "Tokyo"
                        ? `${locationService.formatCityCoordinates("Tokyo")}`
                        : `${locationService.formatCityCoordinates(DEFAULT_LOCATION)}`}
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-14 h-14 text-yellow-200"
    >
      <circle cx="12" cy="12" r="5" />
      <path
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        strokeWidth="2"
        stroke="currentColor"
      />
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
  themeColor,
}: {
  location?: string;
  temperature?: number;
  description?: string;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
  themeColor: string;
}) {
  const safeLocation = sanitizeText(location);
  const safeDescription = sanitizeText(description);

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="rounded-xl shadow-xl mt-6 mb-4 max-w-md w-full"
    >
      <div className="bg-white/20 p-4 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white capitalize">
              Current Weather in {safeLocation}
            </h3>
          </div>
          <SunIcon />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="text-3xl font-bold text-white">
            {temperature || 70}°
          </div>
          <div className="text-sm text-white capitalize">
            {safeDescription || "Clear skies"}
          </div>
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
