# Code Generation Rules - LangGraph + CopilotKit Weather App

## Project Structure
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Agent**: LangGraph + TypeScript in `/agent` directory
- **Services**: Shared services in `/src/lib/services/`
- Use lowercase folder names with hyphens for web-facing directories

## Framework Patterns
- **CopilotKit Actions**: Use `useCopilotAction` for frontend interactions
- **Shared State**: Use `useCoAgent` for agent state synchronization
- **LangGraph Tools**: Define with `@langchain/core/tools` `tool()` function
- **Model Provider**: Use factory pattern with OpenAI/Ollama fallback

## Minimal Implementation
- Write only essential code that directly solves the problem
- Leverage CopilotKit and LangGraph built-ins over custom implementations
- Use existing `WeatherService` patterns for new services
- Skip boilerplate - focus on core functionality
- Prefer framework solutions over custom code

## TypeScript Patterns
- Use interfaces for data structures (e.g., `WeatherData`)
- Define state types with `AgentState` pattern
- Use Zod schemas for tool parameters and validation
- Leverage TypeScript strict mode configuration

## React/Next.js Patterns
- Use `"use client"` directive for client components
- Implement hooks pattern: `useState`, `useEffect`, `useCopilotAction`
- Use Tailwind CSS classes for styling with theme color variables
- Follow the established component structure (main content + sidebar)

## Agent Development
- Use `StateGraph` with `Annotation.Root()` for state management
- Implement async node functions with proper signatures
- Use `ToolNode` from prebuilt for tool execution
- Follow the routing pattern: `shouldContinue` → `tool_node` → `__end__`

## Service Layer
- Create services as classes with clear interfaces
- Implement API fallback to mock data pattern
- Use environment variables for configuration
- Handle both coordinate and location-based queries

## Testing Strategy
- Use Jest with TypeScript support
- Mock external services and APIs
- Test both agent nodes and frontend services
- Maintain high coverage (90%+) as established

## Error Handling
- Graceful API fallbacks to mock data
- Simple try/catch blocks for service calls
- User-friendly error messages in UI
- Log errors for debugging without exposing internals

## Environment Configuration
- Use `.env` files for agent configuration
- Use `.env.local` for Next.js environment variables
- Support optional API keys with fallback behavior
- Follow established naming conventions

## Code Style
- Use existing patterns from codebase
- Minimize imports - only import what's needed
- Self-documenting variable names
- Consistent async/await usage
- Follow established file organization

## Integration Patterns
- Import services from `../../src/lib/services/` in agent
- Use shared TypeScript interfaces between frontend and agent
- Maintain consistency with existing service layer
- Follow the established project structure