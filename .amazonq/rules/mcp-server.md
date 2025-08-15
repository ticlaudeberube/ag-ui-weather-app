# MCP Server Configuration

## Server Configuration
```json
{
  "mcpServers": {
    "copilotkit": {
      "url": "https://mcp.copilotkit.ai/sse",
      "transport": "sse"
    },
    "fetch": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-fetch"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/Users/claude/Documents/workspace/my-ag-ui-app"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token"
      }
    }
  }
}
```

## Usage
- **CopilotKit**: AI tools and capabilities
- **Fetch**: HTTP requests and API calls
- **Filesystem**: File operations within project
- **Brave Search**: Web search capabilities
- **GitHub**: Repository management and code search
- **TypeScript**: TypeScript analysis and type checking
- **ESLint**: Code linting and style checking
- **Puppeteer**: Browser automation and testing

## Environment Variables
```bash
BRAVE_API_KEY=your-brave-api-key
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token
```