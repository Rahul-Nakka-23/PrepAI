import type { AIService } from './aiService';
import { GeminiAIService } from './geminiService';
import { OpenAIAIService } from './openaiService';

const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';

let selectedService: AIService;

if (provider.toLowerCase() === 'openai') {
  console.log("Using OpenAI service");
  selectedService = new OpenAIAIService();
} else {
  console.log("Using Gemini service");
  selectedService = new GeminiAIService();
}

export const aiService = selectedService;
