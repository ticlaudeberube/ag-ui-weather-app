# LangGraph + CopilotKit Rules

## Core Architecture
- Use LangGraph `StateGraph` for agent workflows
- Integrate CopilotKit actions with `convertActionsToDynamicStructuredTools`
- Follow the established agent pattern: state → nodes → edges → tools
- Use `MemorySaver` for conversation persistence

## State Management
- Define state with `Annotation.Root()` pattern
- Use `Annotation<BaseMessage[]>` for message history with concat reducer
- Include `tools` field for CopilotKit action integration
- Add domain-specific state fields (e.g., `lastLocation`)

## Model Provider Pattern
- Use factory function `createModel()` for model selection
- Support OpenAI/Ollama fallback based on `OPENAI_API_KEY`
- Configure via environment variables: `OPENAI_MODEL`, `OLLAMA_MODEL`, `MODEL_TEMPERATURE`
- Use `ChatOpenAI` and `ChatOllama` from respective packages

## Tool Integration
- Define tools with `@langchain/core/tools` `tool()` function
- Use Zod schemas for tool parameters
- Integrate with existing services (e.g., `WeatherService`)
- Combine LangGraph tools with CopilotKit actions via `bindTools()`

## Node Implementation
- Create async node functions with `(state: AgentState, config: RunnableConfig)` signature
- Use `SystemMessage` for agent personality/instructions
- Return state updates as objects with relevant fields
- Use `ToolNode` from prebuilt for tool execution

## Conditional Logic
- Implement `shouldContinue` functions for routing
- Check `tool_calls` on last `AIMessage` for tool routing
- Route to `tool_node` for LangGraph tools, let CopilotKit handle frontend actions
- Use `__end__` for conversation termination

## Graph Construction
- Use `StateGraph(AgentStateAnnotation)` constructor
- Add nodes with `.addNode(name, function)`
- Connect with `.addEdge()` and `.addConditionalEdges()`
- Start from `START` constant
- Compile with checkpointer: `workflow.compile({ checkpointer: memory })`

## Message Handling
- Use `BaseMessage` types: `SystemMessage`, `AIMessage`, `HumanMessage`
- Access message history via `state.messages`
- Handle tool calls through `lastMessage.tool_calls`
- Maintain conversation context across turns

## Environment Configuration
- Use `.env` files in agent directory
- Support both OpenAI and Ollama configurations
- Include optional LangSmith integration
- Follow the established env variable naming

## Testing Strategy
- Test individual nodes with mock state
- Mock external services (e.g., `WeatherService`)
- Test conditional routing logic
- Verify tool integration and state updates

## Error Handling
- Handle model provider failures gracefully
- Validate tool parameters with Zod
- Log tool calls and responses for debugging
- Provide fallback responses for service failures

## Performance
- Use async/await for all model and tool calls
- Implement proper error boundaries
- Cache model instances in provider
- Minimize state object size

## Integration Patterns
- Import services from `../../src/lib/services/`
- Use existing TypeScript interfaces and types
- Maintain consistency with frontend service layer
- Follow established project structure