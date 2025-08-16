# Testing Rules - LangGraph + CopilotKit Weather App

## Test Preservation
- NEVER delete existing test cases or test files
- Preserve all tests that validate current behavior
- When refactoring, update tests only if functionality changes
- Add new tests for new features, don't replace existing ones
- Keep integration tests that verify end-to-end workflows
- Maintain test data and fixtures used by existing tests

## Project Test Structure
- **Agent Tests**: `agent/src/__tests__/` - LangGraph workflows, tools, model provider
- **App Tests**: `src/__tests__/` - Services, utilities, React components
- **Mock Data**: `src/lib/services/mocks/` - Weather API response fixtures
- **Unified Coverage**: Root Jest config combines both test suites

## Testing Frameworks
- **Jest**: Primary testing framework with TypeScript support
- **ts-jest**: TypeScript transformation for Jest
- **jsdom**: Browser environment simulation for React components
- **Node**: Server environment for agent and service tests

## Agent Testing Patterns
- Mock `createModel()` with `jest.fn()` returning `bindTools` mock
- Mock `WeatherService` with resolved promises for consistent data
- Mock `convertActionsToDynamicStructuredTools` from CopilotKit
- Test individual nodes with mock state objects
- Test conditional routing logic (`shouldContinue` function)
- Verify tool integration and state updates

## Service Testing Patterns
- Mock `global.fetch` for API testing
- Test both API success and fallback to mock data
- Test coordinate and location-based queries
- Verify environment variable handling (API keys)
- Test error handling and graceful degradation

## Mock Data Strategy
- Use real OpenWeatherMap API response format
- Store city-specific mock files (montreal.json, newyork.json, etc.)
- Include metric/imperial unit handling
- Maintain consistent data structure across mocks

## Coverage Requirements
- **Agent**: 90%+ coverage for LangGraph workflows
- **App**: 90%+ coverage for services and utilities
- **Overall**: 90%+ unified coverage across project
- Exclude test files and type definitions from coverage

## Test Organization
- Group tests by functionality (describe blocks)
- Use descriptive test names that explain behavior
- Test both success and error scenarios
- Include edge cases (empty arrays, undefined values)

## Mocking Best Practices
- Clear mocks between tests with `jest.clearAllMocks()`
- Mock external dependencies at module level
- Use `jest.fn()` for function mocks with resolved/rejected values
- Mock environment variables for configuration testing

## Integration Testing
- Test agent graph compilation and execution
- Test service layer with both API and mock responses
- Verify tool parameter validation with Zod schemas
- Test state management and message handling

## Error Testing
- Test API failures and fallback behavior
- Test invalid input handling
- Test network errors and timeouts
- Test missing environment variables

## Performance Testing
- Test async operations complete successfully
- Verify tool execution doesn't hang
- Test concurrent operations where applicable
- Monitor test execution time

## Test Data Management
- Keep mock data synchronized with real API responses
- Use consistent city coordinates across tests
- Maintain weather data that matches service expectations
- Update mock data when API structure changes

## Debugging Tests
- Use descriptive error messages
- Log relevant state for debugging
- Include context in test failures
- Use Jest's built-in debugging capabilities