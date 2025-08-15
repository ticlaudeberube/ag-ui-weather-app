import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";

export function createModel() {
  const useOpenAI = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL || "gpt-4o";
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:3b";
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const temperature = parseFloat(process.env.MODEL_TEMPERATURE || "0");
  
  if (useOpenAI) {
    console.log(`Using OpenAI model: ${openaiModel}`);
    return new ChatOpenAI({
      temperature,
      model: openaiModel
    });
  }
  
  console.log(`Using Ollama model: ${ollamaModel}`);
  console.log(`Make sure Ollama is running on ${ollamaBaseUrl}`);
  console.log(`Run: ollama serve && ollama pull ${ollamaModel}`);
  
  return new ChatOllama({
    model: ollamaModel,
    temperature,
    baseUrl: ollamaBaseUrl
  });
}