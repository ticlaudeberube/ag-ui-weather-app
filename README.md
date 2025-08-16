# CopilotKit <> LangGraph Starter

This is a starter template for building AI agents using [LangGraph](https://www.langchain.com/langgraph) and [CopilotKit](https://copilotkit.ai). It provides a modern Next.js application with an integrated LangGraph agent to be built on top of.

## Prerequisites

- Node.js 18+ 
- Python 3.8+
- Any of the following package managers:
  - [pnpm](https://pnpm.io/installation) (recommended)
  - npm
  - [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
  - [bun](https://bun.sh/)
- OpenAI API Key (for the LangGraph agent)

## Model Configuration

The project automatically selects between OpenAI and local Ollama models:

**Automatic Fallback Pattern:**
- If `OPENAI_API_KEY` is set and not empty → Uses OpenAI
- If `OPENAI_API_KEY` is empty or unset → Uses local Ollama

Customize models and settings in `agent/.env`:
```bash
# Model temperature (0-1)
MODEL_TEMPERATURE=0

# OpenAI settings (uncomment to use OpenAI)
# OPENAI_API_KEY=your-api-key
# OPENAI_MODEL=gpt-4o

# Ollama settings (used when no OpenAI key)
OLLAMA_MODEL=llama3.2:3b
OLLAMA_BASE_URL=http://localhost:11434

# LangSmith (optional - for monitoring/debugging)
# LANGSMITH_API_KEY=your-langsmith-api-key
# LANGSMITH_PROJECT=your-project-name
```

> **Note:** This repository ignores lock files (package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb) to avoid conflicts between different package managers. Each developer should generate their own lock file using their preferred package manager. After that, make sure to delete it from the .gitignore.

## Getting Started

1. Install dependencies using your preferred package manager:
```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install

# Using bun
bun install
```

2. Install dependencies for the LangGraph agent:
```bash
cd agent
```
```bash
# Using pnpm (recommended)
pnpm install 

# Using npm
npm run install

# Using yarn
yarn install

# Using bun
bun run install
```

3. Set up local models (Ollama):
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model (e.g., llama3.2)
ollama pull llama3.2

# Start Ollama (runs on http://localhost:11434)
ollama serve
```

Alternatively, to use OpenAI:
```bash
cd agent
echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
```



4. (Optional) Set up environment variables in `.env.local`:
```bash
# CopilotKit Cloud (optional)
echo "COPILOT_CLOUD_PUBLIC_API_KEY=your-copilotkit-key" >> .env.local

# MCP Server API Keys (optional)
echo "BRAVE_API_KEY=your-brave-api-key" >> .env.local
echo "GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token" >> .env.local
echo "NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key" >> .env.local
```

**API Key Sources:**
- **CopilotKit**: Get from https://cloud.copilotkit.ai
- **Brave Search**: Sign up at https://api.search.brave.com/
- **GitHub**: Generate at https://github.com/settings/tokens

4. Start the development server:
```bash
# Using pnpm (recommended)
pnpm dev

# Using npm
npm run dev

# Using yarn
yarn dev

# Using bun
bun run dev
```

This will start both the UI and agent servers concurrently.

## Available Scripts
The following scripts can also be run using your preferred package manager:
- `dev` - Starts both UI and agent servers in development mode
- `dev:studio` - Starts the UI and agent with LangGraph Studio
- `dev:debug` - Starts development servers with debug logging enabled
- `dev:ui` - Starts only the Next.js UI server
- `dev:agent` - Starts only the LangGraph agent server
- `dev:agent:studio` - Starts the LangGraph agent server with LangGraph Studio
- `build` - Builds the Next.js application for production
- `start` - Starts the production server
- `lint` - Runs ESLint for code linting
- `install:agent` - Installs Python dependencies for the agent

## MCP Servers

This project is configured with multiple Model Context Protocol (MCP) servers to enhance AI agent capabilities:

### Core Servers
- **CopilotKit** (`https://mcp.copilotkit.ai/sse`): Enhanced AI capabilities and tool orchestration
- **Fetch**: Make HTTP requests, call APIs, scrape websites for real-time data
- **Filesystem**: Read/write project files, navigate directories, manage codebase

### Search & Repository
- **Brave Search**: Search web for documentation, tutorials, and current information
- **GitHub**: Access repositories, search code, read documentation, manage issues

### Development Tools
- **TypeScript**: Analyze code, check types, provide IntelliSense suggestions
- **ESLint**: Lint code, enforce style rules, suggest best practices
- **Puppeteer**: Automate browsers, test React components, take screenshots

### Usage Examples
With these MCP servers, your agent can:
- **"How do I add authentication?"** → Search web + read your files + suggest implementation
- **"Fix TypeScript errors"** → Analyze code + provide fixes + update files
- **"Find React examples"** → Search GitHub + fetch code samples + explain patterns
- **"Test this component"** → Use Puppeteer + create automated tests
- **"Get latest package info"** → Fetch from npm API + suggest updates

### Environment Setup
Add these to your `.env.local` file in the project root:
```bash
# CopilotKit Cloud (optional)
COPILOT_CLOUD_PUBLIC_API_KEY=your-copilotkit-api-key

# MCP Server API Keys (optional)
BRAVE_API_KEY=your-brave-api-key
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token
```

## Documentation

The main UI component is in `src/app/page.tsx`. You can:
- Modify the theme colors and styling
- Add new frontend actions
- Utilize shared-state
- Customize your user-interface for interactin with LangGraph

## 📚 Documentation

- [CopilotKit Documentation](https://docs.copilotkit.ai) - Explore CopilotKit's capabilities
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/) - Learn more about LangGraph and its features
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API

## Contributing

Feel free to submit issues and enhancement requests! This starter is designed to be easily extensible.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Agent Connection Issues
If you see "I'm having trouble connecting to my tools", make sure:
1. The LangGraph agent is running on port 8123
2. Your OpenAI API key is set correctly
3. Both servers started successfully

### MCP Server Issues
If MCP servers aren't working:
1. Ensure required environment variables are set
2. Check that MCP packages are installed globally: `npm install -g @modelcontextprotocol/server-*`
3. Verify API keys for Brave Search and GitHub
