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
  tools: Annotation<any[]>, // ag-ui tools will be added here
});

// 2. Define the type for our agent state
export type AgentState = typeof AgentStateAnnotation.State;

import { WeatherService } from '../../src/lib/services/weather.service';

// 3. Define weather tool with real service integration
const weatherService = new WeatherService();

export const getWeather = tool(
  async (args) => {
    console.log('getWeather called with:', args);
    let weather;
    
    if (args.latitude && args.longitude) {
      weather = await weatherService.getWeatherByCoordinates(args.latitude, args.longitude);
    } else {
      weather = await weatherService.getWeather(args.location || '');
    }
    
    console.log('Weather service returned:', weather);
    const isMetric = weatherService.isMetricLocation(weather.name);
    const tempUnit = isMetric ? '°C' : '°F';
    const windUnit = isMetric ? 'km/h' : 'mph';
    
    const result = `The weather in ${weather.name} is ${weather.temperature}${tempUnit} with ${weather.description}. The humidity is ${weather.humidity}%, the wind speed is ${weather.windSpeed} ${windUnit} and the feels like temperature is ${weather.feelsLike}${tempUnit}.`;
    console.log('Returning:', result);
    return result;
  },
  {
    name: "getWeather",
    description: "Get weather by location name OR coordinates. Returns city name from weather service.",
    schema: z.object({
      location: z.string().optional().describe("The location name to get weather for"),
      latitude: z.number().optional().describe("Latitude coordinate"),
      longitude: z.number().optional().describe("Longitude coordinate"),
    }),
  }
);

// 4. Put our tools into an array
const tools = [getWeather];

// 5. Define the chat node, which will handle the chat logic
export async function chat_node(state: AgentState, config: RunnableConfig) {
  // 5.1 Define the model using the provider
  const model = createModel();

  // 5.2 Bind the tools to the model, include CopilotKit actions. This allows
  //     the model to call tools that are defined in CopilotKit by the frontend.
  const modelWithTools = model.bindTools!(
    [
      ...convertActionsToDynamicStructuredTools(state.tools || []),
      ...tools,
    ],
  );

  // 5.3 Define the system message for weather forecaster personality
  const systemMessage = new SystemMessage({
    content: `You are a function-calling assistant. For ANY weather question, you MUST call the getWeather function. Do NOT provide weather information without calling the function first. Example: User asks "What's the weather in Montreal?" - you MUST call getWeather({location: "Montreal"}).`,
  });

  // 5.4 Invoke the model with the system message and the messages in the state
  const response = await modelWithTools.invoke(
    [systemMessage, ...state.messages],
    config
  );

  // 5.5 Return the response, which will be added to the state
  return {
    messages: response,
  };
}

// 6. Define the function that determines whether to continue or not,
//    this is used to determine the next node to run
export function shouldContinue({ messages, tools }: AgentState) {
  // 6.1 Get the last message from the state
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // 7.2 If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    const toolCallName = lastMessage.tool_calls![0].name;

    // 7.3 Route getWeather calls to tool_node, let CopilotKit actions be handled by frontend
    if (toolCallName === "getWeather") {
      return "tool_node";
    }
  }

  // 6.4 Otherwise, we stop (reply to the user) using the special "__end__" node
  return "__end__";
}

// Define the workflow graph
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chat_node)
  .addNode("tool_node", new ToolNode(tools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue as any);

const memory = new MemorySaver();

export const graph = workflow.compile({
  checkpointer: memory,
});
