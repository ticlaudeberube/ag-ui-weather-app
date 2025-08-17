/// <reference types="jest" />
import {
  graph,
  shouldContinue,
  chat_node,
  getWeather,
  setupAgentWithActions,
} from "../agent";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

// Mock the model provider
const mockInvoke = jest.fn();
const mockBindTools = jest.fn(() => ({ invoke: mockInvoke }));
jest.mock("../services/model-provider", () => ({
  createModel: jest.fn(() => ({ bindTools: mockBindTools })),
}));

// Mock WeatherService
jest.mock("../../../src/lib/services/weather.service", () => ({
  WeatherService: jest.fn().mockImplementation(() => ({
    getWeather: jest.fn().mockResolvedValue({
      name: "Montreal",
      temperature: 70,
      description: "clear skies",
      humidity: 50,
      windSpeed: 10,
      feelsLike: 72,
    }),
    getWeatherByCoordinates: jest.fn().mockResolvedValue({
      name: "Montreal",
      temperature: 70,
      description: "clear skies",
      humidity: 50,
      windSpeed: 10,
      feelsLike: 72,
    }),
  })),
}));

// Mock CopilotKit
jest.mock("@copilotkit/sdk-js/langgraph", () => ({
  convertActionsToDynamicStructuredTools: jest.fn(() => []),
}));

describe("Agent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create graph successfully", () => {
    expect(graph).toBeDefined();
    expect(typeof graph.invoke).toBe("function");
  });

  describe("shouldContinue", () => {
    test("returns __end__ when no tool calls", () => {
      const state = {
        messages: [new AIMessage({ content: "Hello", tool_calls: [] })],
        tools: [],
        lastLocation: "Test City",
      };

      const result = shouldContinue(state);
      expect(result).toBe("__end__");
    });

    test("returns tool_node when tool call exists", () => {
      const state = {
        messages: [
          new AIMessage({
            content: "Hello",
            tool_calls: [{ name: "getWeather", args: {}, id: "1" }],
          }),
        ],
        tools: [],
        lastLocation: "Test City",
      };

      const result = shouldContinue(state);
      expect(result).toBe("tool_node");
    });

    test("returns tool_node when tool matches CopilotKit action", () => {
      const state = {
        messages: [
          new AIMessage({
            content: "Hello",
            tool_calls: [{ name: "setLocation", args: {}, id: "1" }],
          }),
        ],
        tools: [{ name: "setLocation" }],
        lastLocation: "Test City",
      };

      const result = shouldContinue(state);
      expect(result).toBe("tool_node");
    });

    test("handles undefined tools", () => {
      const state = {
        messages: [
          new AIMessage({
            content: "Hello",
            tool_calls: [{ name: "someAction", args: {}, id: "1" }],
          }),
        ],
        tools: [] as any,
        lastLocation: "Test City",
      };

      // Manually set tools to undefined to test the undefined case
      (state as any).tools = undefined;

      const result = shouldContinue(state);
      expect(result).toBe("tool_node");
    });

    test("handles empty messages array", () => {
      const state = {
        messages: [],
        tools: [],
        lastLocation: "Test City",
      };

      expect(() => shouldContinue(state)).toThrow();
    });
  });

  describe("chat_node", () => {
    test("should process state and return response", async () => {
      const mockResponse = new AIMessage({ content: "Test response" });
      mockInvoke.mockResolvedValue(mockResponse);

      const state = {
        messages: [new HumanMessage({ content: "Hello" })],
        tools: [],
        lastLocation: "Montreal",
      };

      const result = await chat_node(state, {});

      expect(result.messages).toBe(mockResponse);
      expect(mockBindTools).toHaveBeenCalled();
      expect(mockInvoke).toHaveBeenCalled();
    });

    test("should handle state with tools", async () => {
      const mockResponse = new AIMessage({ content: "Test response" });
      mockInvoke.mockResolvedValue(mockResponse);

      const state = {
        messages: [new HumanMessage({ content: "Hello" })],
        tools: [{ name: "testTool" }],
        lastLocation: "New York",
      };

      const result = await chat_node(state, {});

      expect(result.messages).toBe(mockResponse);
    });

    test("should handle different locations", async () => {
      const mockResponse = new AIMessage({ content: "Test response" });
      mockInvoke.mockResolvedValue(mockResponse);

      const state = {
        messages: [new HumanMessage({ content: "Hello" })],
        tools: [],
        lastLocation: "London",
      };

      const result = await chat_node(state, {});

      expect(result.messages).toBe(mockResponse);
    });
  });

  describe("getWeather tool", () => {
    test("should return weather information by location", async () => {
      const result = await getWeather.invoke({ cityName: "Montreal" });

      expect(result).toContain("Montreal");
      expect(result).toContain("70");
      expect(result).toContain("clear skies");
    });

    test("should handle current location requests", async () => {
      const result = await getWeather.invoke({ cityName: "current location" });

      expect(result).toContain("Montreal"); // Default location
      expect(result).toContain("70");
      expect(result).toContain("clear skies");
    });

    test("should have correct schema", () => {
      expect(getWeather.name).toBe("getWeather");
      expect(getWeather.description).toBe(
        "Get weather by city name. Always returns response with actual city name, never the term 'current location'.",
      );
    });
  });

  describe("setupAgentWithActions", () => {
    test("should integrate CopilotKit actions correctly", async () => {
      const mockActions = [
        {
          name: "getSelectedCity",
          description: "Get current city",
          parameters: [],
          handler: async () => "Montreal",
        },
      ];

      const agent = await setupAgentWithActions(mockActions);
      expect(agent).toBeDefined();
      expect(typeof agent.invoke).toBe("function");
    });
  });
});
