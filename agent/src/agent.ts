/**
 * This is the main entry point for the agent.
 * It defines the workflow graph, state, tools, nodes and edges.
 */

import { z } from "zod";
import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { createModel } from "./services/model-provider";
import { convertActionsToDynamicStructuredTools } from "@copilotkit/sdk-js/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

// 1. Define our agent state for weather forecaster
const AgentStateAnnotation = Annotation.Root({
  // Define a 'messages' channel to store an array of BaseMessage objects
  messages: Annotation<BaseMessage[]>({
    // Reducer function: Combines the current state with new messages
    reducer: (currentState, updateValue) => currentState.concat(updateValue),
    // Default function: Initialize the channel with an empty array
    default: () => [],
  }),
  lastLocation: Annotation<string>,
  tools: Annotation<unknown[]>, // ag-ui tools will be added here
});

// 2. Define the type for our agent state
export type AgentState = typeof AgentStateAnnotation.State;

import { WeatherService } from "../../src/lib/services/weather.service";

// 3. Define weather tool with real service integration
const weatherService = new WeatherService();

export const getWeather = tool(
  async (args) => {
    try {
      console.log("getWeather called with:", args);
      const weather = await weatherService.getWeather(args.cityName);

      const isMetric = !weather.name.toLowerCase().includes("new york");
      const tempUnit = isMetric ? "°C" : "°F";
      const windUnit = isMetric ? "km/h" : "mph";

      // Return structured data that can be parsed for displayWeatherCard
      const weatherData = {
        location: weather.name,
        temperature: weather.temperature,
        description: weather.description,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        feelsLike: weather.feelsLike,
        tempUnit,
        windUnit,
      };

      return JSON.stringify(weatherData);
    } catch (error) {
      console.error("getWeather error:", error);
      return JSON.stringify({
        error: "Sorry, I couldn't get weather data for the requested location.",
      });
    }
  },
  {
    name: "getWeather",
    description:
      "Get weather by city name. Always returns response with actual city name, never the term 'current location'.",
    schema: z.object({
      cityName: z
        .string()
        .describe("Exact city name (e.g., 'Paris', 'New York', 'Montreal')"),
    }),
  },
);

// 4. Put our tools into an array (getSelectedCity will come from frontend actions)
const tools = [getWeather];

// 5.1 Add CopilotKit actions integration
export async function setupAgentWithActions(actions: unknown[]) {
  const copilotKitTools = convertActionsToDynamicStructuredTools(actions);
  const allTools = [...tools, ...copilotKitTools];

  const workflow = new StateGraph(AgentStateAnnotation)
    .addNode("chat_node", async (state: AgentState, config: RunnableConfig) => {
      const model = createModel();
      const modelWithTools = model.bindTools!(allTools);

      const systemMessage = new SystemMessage({
        content: `You are a weather assistant with access to getWeather, getSelectedCity, and displayWeatherCard tools.
        
        CRITICAL RULE: NEVER use the phrase "current location" in ANY part of your response. ALWAYS use actual city names.
        
        For current location questions ("my location", "here", "what's the weather"):
        1. Call getSelectedCity() first to get the actual city name
        2. Use returned city name in getWeather({ cityName: "ActualCity" })
        3. ALWAYS call displayWeatherCard with the weather data from step 2
        4. Provide a brief, friendly response
        
        For specific cities ("weather in Tokyo"):
        1. Call getWeather({ cityName: "Tokyo" })
        2. ALWAYS call displayWeatherCard with the weather data from step 1
        3. Provide a brief, friendly response
        
        IMPORTANT: You MUST call displayWeatherCard for every weather request to show the visual weather card.
        Extract temperature, description, humidity, windSpeed, feelsLike from getWeather response and pass to displayWeatherCard.
        
        FORBIDDEN PHRASES: "current location", "your current location", "the current location"`,
      });

      const response = await modelWithTools.invoke(
        [systemMessage, ...state.messages],
        config,
      );

      return { messages: response };
    })
    .addNode("tool_node", new ToolNode(allTools))
    .addEdge(START, "chat_node")
    .addEdge("tool_node", "chat_node")
    .addConditionalEdges("chat_node", (state: AgentState) => {
      const lastMessage = state.messages[
        state.messages.length - 1
      ] as AIMessage;
      if (lastMessage.tool_calls?.length) {
        return "tool_node";
      }
      return "__end__";
    });

  return workflow.compile({ checkpointer: new MemorySaver() });
}

// 5. Define the chat node, which will handle the chat logic
export async function chat_node(state: AgentState, config: RunnableConfig) {
  // 5.1 Define the model using the provider
  const model = createModel();

  // 5.2 Bind ONLY our specific tools, block CopilotKit actions
  const modelWithTools = model.bindTools!(tools);

  // 5.3 Define the system message for weather forecaster personality
  const systemMessage = new SystemMessage({
    content: `You are a weather assistant. You have access to getWeather tool.
    
    For weather questions with specific cities mentioned:
    - Extract city name and call getWeather({ cityName: "CityName" })
    
    For current location questions ("What's the weather?", "weather at my current location", "current location"):
    - Call getWeather({ cityName: "current location" })
    - Nerver use current location
    - Use city name instead
    
    Always return complete weather information from getWeather results including temperature, description, humidity, wind speed, and feels-like temperature.`,
  });

  // 5.4 Invoke the model with the system message and the messages in the state
  const response = await modelWithTools.invoke(
    [systemMessage, ...state.messages],
    config,
  );

  // 5.5 Return the response, which will be added to the state
  return {
    messages: response,
  };
}

// 6. Define the function that determines whether to continue or not
export function shouldContinue({ messages }: AgentState) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  console.log(
    "shouldContinue - last message type:",
    lastMessage.constructor.name,
  );
  console.log(
    "shouldContinue - tool_calls:",
    lastMessage.tool_calls?.length || 0,
  );

  if (lastMessage.tool_calls?.length) {
    const toolCallName = lastMessage.tool_calls![0].name;
    console.log("shouldContinue - routing tool call:", toolCallName);
    return "tool_node";
  }

  console.log("shouldContinue - ending conversation");
  return "__end__";
}

// Create a default graph that will be enhanced with CopilotKit actions at runtime
const createDefaultGraph = () => {
  const workflow = new StateGraph(AgentStateAnnotation)
    .addNode("chat_node", async (state: AgentState, config: RunnableConfig) => {
      const model = createModel();
      const modelWithTools = model.bindTools!(tools);

      const systemMessage = new SystemMessage({
        content: `You are a weather assistant. You have access to getWeather tool.
        
        For weather questions with specific cities mentioned:
        - Extract city name and call getWeather({ cityName: "CityName" })
        
        For current location questions ("What's the weather?", "weather at my current location", "current location"):
        - Call getWeather({ cityName: "Montreal" }) as default location
        
        The getWeather tool returns JSON data. Parse it and provide a friendly response with the weather information.`,
      });

      const response = await modelWithTools.invoke(
        [systemMessage, ...state.messages],
        config,
      );

      return { messages: response };
    })
    .addNode("tool_node", new ToolNode(tools))
    .addEdge(START, "chat_node")
    .addEdge("tool_node", "chat_node")
    .addConditionalEdges("chat_node", shouldContinue as any);

  return workflow.compile({ checkpointer: new MemorySaver() });
};

export const graph = createDefaultGraph();
