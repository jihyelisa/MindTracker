import axios from 'axios';
import type { Entry, CreateEntryPayload, UpdateEntryPayload, WeeklySummary, StatsData, Tag, AiInsight, AiTagSuggestions, User, LoginRequest, RegisterRequest } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5254';

const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

// ── Auth ──────────────────────────────────────────────────────────
export const fetchDemoUser = (): Promise<User> =>
  api.get<User>('/api/auth/demo').then(r => r.data);

export const login = (payload: LoginRequest): Promise<User> =>
  api.post<User>('/api/auth/login', payload).then(r => r.data);

export const register = (payload: RegisterRequest): Promise<User> =>
  api.post<User>('/api/auth/register', payload).then(r => r.data);

// ── Entries ──────────────────────────────────────────────────────
export const fetchEntries = (userId: number, moodFilter?: number, limit = 50): Promise<Entry[]> =>
  api.get<Entry[]>('/api/entries', {
    params: { userId, ...(moodFilter ? { moodFilter } : {}), limit }
  }).then(r => r.data);

export const fetchEntry = (id: number): Promise<Entry> =>
  api.get<Entry>(`/api/entries/${id}`).then(r => r.data);

export const createEntry = (userId: number, payload: CreateEntryPayload): Promise<Entry> =>
  api.post<Entry>('/api/entries', payload, { params: { userId } }).then(r => r.data);

export const updateEntry = (id: number, payload: UpdateEntryPayload): Promise<Entry> =>
  api.put<Entry>(`/api/entries/${id}`, payload).then(r => r.data);

export const deleteEntry = (id: number): Promise<void> =>
  api.delete(`/api/entries/${id}`).then(() => undefined);

export const fetchWeeklySummary = (userId: number): Promise<WeeklySummary> =>
  api.get<WeeklySummary>('/api/entries/summary', { params: { userId } }).then(r => r.data);

export const fetchStats = (userId: number, days = 30): Promise<StatsData> =>
  api.get<StatsData>('/api/entries/stats', { params: { userId, days } }).then(r => r.data);

// ── Tags ─────────────────────────────────────────────────────────
export const fetchTags = (): Promise<Tag[]> =>
  api.get<Tag[]>('/api/tags').then(r => r.data);

// ── AI ───────────────────────────────────────────────────────────
export const fetchTagSuggestions = (text: string, language = 'en'): Promise<AiTagSuggestions> =>
  api.post<AiTagSuggestions>('/api/ai/tag-suggestions', { text, language }).then(r => r.data);

export const fetchAiInsight = (userId: number, language = 'en'): Promise<AiInsight> =>
  api.post<AiInsight>('/api/ai/insight', { userId, language }).then(r => r.data);
