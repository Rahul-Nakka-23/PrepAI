// Add TypeScript declaration for import.meta.env
declare global {
    interface ImportMeta {
        env: {
            VITE_GEMINI_API_KEY?: string;
            VITE_AI_PROVIDER?: string;
        };
    }
}
import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { TranscriptMessage, Evaluation, RoadmapItem, InterviewType } from '../types';
import { AIService } from "./aiService";

class GeminiAIService implements AIService {
    private ai: GoogleGenAI;
    private chat: Chat | null = null;

    constructor() {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!API_KEY) {
            throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please set it in Vercel dashboard.");
        }
        this.ai = new GoogleGenAI({ apiKey: API_KEY });
    }

    startInterviewChat = (goal: string, types: InterviewType[]) => {
        const interviewRounds = types.join(' and ');
        this.chat = this.ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a friendly but professional interviewer. Your goal is to conduct a mock interview for a candidate aspiring to be a '${goal}'.
                The interview will cover the following rounds: ${interviewRounds}.
                Ask insightful questions one by one based on these topics.
                If the candidate seems to be struggling with a question, try asking a simpler follow-up question to help them demonstrate their knowledge.
                Start with an introductory question. Keep your questions concise.`
            }
        });
    };

    streamNextQuestion = async (message: string): Promise<AsyncGenerator<string>> => {
        const chatInstance = this.chat;
        async function* streamGenerator() {
            if (!chatInstance) {
                throw new Error("Chat not initialized. Call startInterviewChat first.");
            }
            const stream = await chatInstance.sendMessageStream({ message });
            for await (const chunk of stream) {
                yield chunk.text;
            }
        }
        return streamGenerator();
    };

    generateEvaluation = async (transcript: TranscriptMessage[], goal: string): Promise<Evaluation> => {
        const transcriptText = transcript.map(m => `${m.speaker}: ${m.text}`).join('\n');

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following interview transcript for a candidate aspiring to be a '${goal}', please evaluate their performance.
        
            Transcript:
            ${transcriptText}
            
            Provide a detailed evaluation based on the candidate's answers. Assess their technical knowledge, problem-solving skills, and confidence.
            In addition to the above, please provide specific feedback on the candidate's communication style. Analyze their clarity, conciseness, and any noticeable use of filler words (e.g., "um", "like", "so").
            Finally, assign a level: 'Beginner', 'Intermediate', or 'Advanced'.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: 'A brief overall summary of the candidate performance.' },
                        knowledge: { type: Type.STRING, description: 'Assessment of technical knowledge.' },
                        skills: { type: Type.STRING, description: 'Assessment of problem-solving skills.' },
                        confidence: { type: Type.STRING, description: 'Assessment of confidence inferred from the answers.' },
                        communication: { type: Type.STRING, description: 'Feedback on communication style, including clarity, filler words, and overall fluency.' },
                        level: { type: Type.STRING, description: 'The overall level of the candidate: Beginner, Intermediate, or Advanced.' }
                    },
                    required: ['summary', 'knowledge', 'skills', 'confidence', 'communication', 'level']
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    };

    generateRoadmap = async (level: string, goal: string): Promise<Omit<RoadmapItem, 'id' | 'completed'>[]> => {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `A candidate for a '${goal}' role has been evaluated as '${level}'. Create a comprehensive, personalized learning roadmap for them with 5-7 key steps.
            If the level is 'Beginner', focus on fundamental concepts.
            If 'Intermediate', focus on deepening knowledge and practical skills.
            If 'Advanced', focus on specialized topics, system design, and leadership.

            For each roadmap item, provide the following:
            1.  'title': A concise title for the learning topic.
            2.  'description': A short, clear explanation of the topic and its importance.
            3.  'keyConcepts': An array of 3-5 crucial sub-topics or concepts to master.
            4.  'project': A small, practical project idea to apply the learned skills.
            5.  'resources': An array of 2-3 diverse, high-quality online resources. For each resource, specify a 'title', a 'url', and a 'type' from the following options: 'article', 'video', 'docs', or 'interactive'.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            keyConcepts: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            project: { type: Type.STRING },
                            resources: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        type: { type: Type.STRING },
                                        title: { type: Type.STRING },
                                        url: { type: Type.STRING }
                                    },
                                    required: ['type', 'title', 'url']
                                }
                            }
                        },
                        required: ['title', 'description', 'keyConcepts', 'project', 'resources']
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    };
}

export { GeminiAIService };
