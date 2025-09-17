import type { AIService } from './aiService';
import { GeminiAIService } from './geminiService';

const aiService: AIService = new GeminiAIService();
export { aiService };
