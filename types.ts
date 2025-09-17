export type Page = 'login' | 'setup' | 'interview' | 'results' | 'dashboard';
export type InterviewType = 'behavioral' | 'technical';

export interface User {
  name: string;
  goal: string;
}

export interface TranscriptMessage {
  speaker: 'ai' | 'user';
  text: string;
}

export interface Evaluation {
  summary: string;
  knowledge: string;
  skills: string;
  confidence: string;
  communication: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Resource {
    type: 'article' | 'video' | 'docs' | 'interactive';
    title: string;
    url: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  keyConcepts: string[];
  project: string;
  resources: Resource[];
  completed: boolean;
}