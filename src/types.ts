export type Goal = 'travel' | 'work' | 'daily' | 'exam';
export type Language = 'en';
export type Screen = 'onboarding' | 'home' | 'scenario' | 'review' | 'progress' | 'pattern';

export type WeaknessArea = 'prepositions' | 'pronunciation' | 'wordOrder' | 'retention' | 'grammar';

export type NotificationSlot = 'morning' | 'lunch' | 'evening' | 'bedtime';

export interface NotificationPreferences {
  enabled: boolean;
  slots: Record<NotificationSlot, boolean>;
  slotTimes: Record<NotificationSlot, string>;
}

export interface UserProfile {
  name: string;
  goal: Goal;
  targetLanguage: Language;
  specificGoal?: string;
  targetDate?: string;
  targetLevel?: string;
  curriculumPlan?: CurriculumStep[];
  dailyPlan?: DailyMission[];
  planner?: PlannerSnapshot;
  restDayOfWeek?: number;
  dailyMinutes?: number;
  notificationPrefs?: NotificationPreferences;
  weaknessScores: Record<WeaknessArea, number>;
}

export interface CurriculumStep {
  id: string;
  title: string;
  focus: string;
  outcome: string;
  duration: string;
}

export interface DailyMission {
  id: string;
  timeOfDay: string;
  minutes: number;
  title: string;
  purpose: string;
  reason?: string;
  phase?: 'focus' | 'integrate' | 'practice';
}

export interface PlannerSnapshot {
  feasibility: number;
  feasibilityStatus: 'shortfall' | 'balanced' | 'surplus';
  feasibilityLabel: string;
  adjustmentHint?: string;
  targetPlLevel: number;
}

export interface ScenarioLine {
  speaker: 'partner' | 'learner';
  text: string;
  ja: string;
  hint?: string;
}

export interface Scenario {
  id: string;
  title: string;
  titleJa: string;
  goalTags: Goal[];
  weaknessTags: WeaknessArea[];
  difficulty: 1 | 2 | 3;
  summaryJa: string;
  lines: ScenarioLine[];
  vocab: VocabCard[];
}

export interface PatternDrillChoice {
  id: string;
  text: string;
  tipJa?: string;
  isCorrect: boolean;
}

export interface PatternDrill {
  id: string;
  cueJa: string;
  fullSentenceEn: string;
  fullSentenceJa: string;
  choices: PatternDrillChoice[];
}

export type PatternLevel = 'junior-high-1' | 'junior-high-2' | 'junior-high-3' | 'high-school';

export interface SentencePattern {
  id: string;
  titleJa: string;
  level: PatternLevel;
  order: number;
  formulaEn: string;
  glossJa: string;
  explainJa: string;
  pitfallJa?: string;
  goalTags: Goal[];
  weaknessTags: WeaknessArea[];
  scenarioIds: string[];
  showcaseEn: string;
  showcaseJa: string;
  drills: PatternDrill[];
}

export interface VocabCard {
  id: string;
  front: string;
  backJa: string;
  example: string;
  weaknessTag: WeaknessArea;
  interval: number;
  ease: number;
  dueAt: string;
  reviews: number;
}

export interface SessionStats {
  scenariosCompleted: string[];
  patternsCompleted: string[];
  totalXp: number;
  minutesLearned: number;
  lastActiveDate: string;
  rhythmDays: string[];
}
