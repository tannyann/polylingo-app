import type { SessionStats, UserProfile, VocabCard } from '../types';

const PROFILE_KEY = 'polylingo:profile';
const STATS_KEY = 'polylingo:stats';
const VOCAB_KEY = 'polylingo:vocab';

const today = () => new Date().toISOString().slice(0, 10);

export function loadProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadStats(): SessionStats {
  const fallback: SessionStats = {
    scenariosCompleted: [],
    patternsCompleted: [],
    totalXp: 0,
    minutesLearned: 0,
    lastActiveDate: today(),
    rhythmDays: [],
  };
  const raw = localStorage.getItem(STATS_KEY);
  if (!raw) return fallback;
  return { ...fallback, ...(JSON.parse(raw) as Partial<SessionStats>) };
}

export function saveStats(stats: SessionStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadVocab(): VocabCard[] {
  const raw = localStorage.getItem(VOCAB_KEY);
  return raw ? (JSON.parse(raw) as VocabCard[]) : [];
}

export function saveVocab(cards: VocabCard[]) {
  localStorage.setItem(VOCAB_KEY, JSON.stringify(cards));
}

export function touchRhythm(stats: SessionStats): SessionStats {
  const day = today();
  return {
    ...stats,
    lastActiveDate: day,
    rhythmDays: stats.rhythmDays.includes(day) ? stats.rhythmDays : [...stats.rhythmDays, day].slice(-30),
  };
}
