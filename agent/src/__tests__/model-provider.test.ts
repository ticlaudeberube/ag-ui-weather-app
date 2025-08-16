/// <reference types="jest" />
import { createModel } from '../services/model-provider';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';

// Mock the environment
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('createModel', () => {
  test('should create ChatOllama when no OpenAI key', () => {
    delete process.env.OPENAI_API_KEY;
    const model = createModel();
    expect(model).toBeInstanceOf(ChatOllama);
  });

  test('should create ChatOpenAI when API key is set', () => {
    process.env.OPENAI_API_KEY = 'sk-test-key';
    const model = createModel();
    expect(model).toBeInstanceOf(ChatOpenAI);
  });

  test('should use custom Ollama model from env', () => {
    delete process.env.OPENAI_API_KEY;
    process.env.OLLAMA_MODEL = 'llama3.1:7b';
    const model = createModel() as ChatOllama;
    expect(model.model).toBe('llama3.1:7b');
  });

  test('should use custom OpenAI model from env', () => {
    process.env.OPENAI_API_KEY = 'sk-test-key';
    process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
    const model = createModel() as ChatOpenAI;
    expect(model.modelName).toBe('gpt-3.5-turbo');
  });

  test('should use custom temperature from env', () => {
    process.env.OPENAI_API_KEY = 'sk-test-key';
    process.env.MODEL_TEMPERATURE = '0.7';
    const model = createModel() as ChatOpenAI;
    expect(model.temperature).toBe(0.7);
  });
});