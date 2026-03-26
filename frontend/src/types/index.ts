export interface User {
  id: number;
  name: string;
  email: string;
  isDemo: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface Tag {
  id: number;
  name: string;
}

export interface Entry {
  id: number;
  date: string; // ISO date string
  mood: MoodLevel;
  text: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface CreateEntryPayload {
  date: string;
  mood: MoodLevel;
  text: string;
  tagIds: number[];
  tagNames?: string[];
}

export interface UpdateEntryPayload {
  mood: MoodLevel;
  text: string;
  tagIds: number[];
  tagNames?: string[];
}

export interface WeeklySummary {
  averageMood: number;
  streak: number;
  totalEntries: number;
}

export interface MoodDistribution {
  mood: number;
  count: number;
}

export interface StatsData {
  moodDistribution: MoodDistribution[];
  moodTrend: { date: string; mood: number }[];
  tagAnalysis: { tag: string; count: number }[];
}

export interface AiInsight {
  summary: string;
  suggestion: string;
}

export interface AiTagSuggestions {
  tags: string[];
}
