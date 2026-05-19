import type { WeaknessArea } from '../types';

export interface ImportedDiagnostic {
  specificGoal?: string;
  targetDate?: string;
  dailyMinutes?: number;
  weaknessScores?: Record<WeaknessArea, number>;
}

export function loadImportedDiagnostic(): ImportedDiagnostic | null {
  const raw = localStorage.getItem('polylingo:full-diagnostic');
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as {
      profile?: { specificGoal?: string; targetDate?: string; dailyMinutes?: number };
      scores?: Record<string, number>;
    };
    if (!data.scores) return null;
    const weaknessScores = {
      prepositions: data.scores.prep ?? 60,
      pronunciation: data.scores.pron ?? 60,
      wordOrder: data.scores.syntax ?? 60,
      retention: data.scores.mem ?? 60,
      grammar: data.scores.listen ?? 60,
    };
    return {
      specificGoal: data.profile?.specificGoal,
      targetDate: data.profile?.targetDate,
      dailyMinutes: data.profile?.dailyMinutes,
      weaknessScores,
    };
  } catch {
    return null;
  }
}
