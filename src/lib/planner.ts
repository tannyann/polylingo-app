import type { CurriculumStep, DailyMission, Goal, WeaknessArea } from '../types';

export type PlannerDomain = 'prepositions' | 'retention' | 'pronunciation' | 'wordOrder' | 'listening';
export type GoalType = 'exam' | 'occasion' | 'level';
export type FeasibilityStatus = 'shortfall' | 'balanced' | 'surplus';
export type PlanPhase = 'focus' | 'integrate' | 'practice';

export interface PlannerInput {
  goal: Goal;
  goalType: GoalType;
  specificGoal: string;
  targetDate: string;
  targetLevel: string;
  targetPlLevel: number;
  dailyMinutes: number;
  weeklyLongMinutes: number;
  restDayOfWeek: number;
  weaknessScores: Record<WeaknessArea, number>;
  primaryWeakness: WeaknessArea;
}

export interface PhasePlan {
  id: PlanPhase;
  title: string;
  duration: string;
  focus: string;
  domains: PlannerDomain[];
  milestone: string;
}

export interface PlannerMission extends DailyMission {
  reason: string;
  phase: PlanPhase;
}

export interface PlannerResult {
  feasibility: number;
  feasibilityStatus: FeasibilityStatus;
  feasibilityLabel: string;
  adjustmentHint?: string;
  gaps: Record<PlannerDomain, number>;
  requiredMinutes: Record<PlannerDomain, number>;
  availableMinutes: number;
  phases: PhasePlan[];
  curriculumPlan: CurriculumStep[];
  dailyPlan: PlannerMission[];
  weeklyFocusDomain: PlannerDomain;
}

const LEARNING_RATES: Record<PlannerDomain, number> = {
  prepositions: 1.5,
  retention: 1.0,
  pronunciation: 0.6,
  wordOrder: 0.8,
  listening: 0.7,
};

const TARGET_BY_PL: Record<number, Record<PlannerDomain, number>> = {
  3: { prepositions: 55, retention: 55, pronunciation: 50, wordOrder: 55, listening: 55 },
  4: { prepositions: 62, retention: 62, pronunciation: 58, wordOrder: 62, listening: 60 },
  5: { prepositions: 68, retention: 68, pronunciation: 65, wordOrder: 68, listening: 66 },
  6: { prepositions: 74, retention: 74, pronunciation: 72, wordOrder: 74, listening: 72 },
  7: { prepositions: 80, retention: 80, pronunciation: 78, wordOrder: 80, listening: 78 },
  8: { prepositions: 86, retention: 86, pronunciation: 84, wordOrder: 86, listening: 84 },
  9: { prepositions: 92, retention: 92, pronunciation: 90, wordOrder: 92, listening: 90 },
  10: { prepositions: 96, retention: 96, pronunciation: 94, wordOrder: 96, listening: 94 },
};

const DOMAIN_LABELS: Record<PlannerDomain, string> = {
  prepositions: '前置詞',
  retention: '定着',
  pronunciation: '発音',
  wordOrder: '語順',
  listening: 'リスニング',
};

const WEAKNESS_TO_DOMAIN: Record<WeaknessArea, PlannerDomain> = {
  prepositions: 'prepositions',
  retention: 'retention',
  pronunciation: 'pronunciation',
  wordOrder: 'wordOrder',
  grammar: 'listening',
};

export function buildMasterPlan(input: PlannerInput): PlannerResult {
  const current = scoresToDomains(input.weaknessScores);
  const target = targetScoresForLevel(input.targetPlLevel);
  const gaps = computeGaps(current, target);
  const requiredMinutes = computeRequiredMinutes(gaps, current);
  const totalDays = daysUntil(input.targetDate);
  const learningDays = Math.max(1, totalDays - countRestDays(totalDays, input.restDayOfWeek));
  const availableMinutes = Math.round(
    (learningDays * input.dailyMinutes + Math.floor(learningDays / 7) * input.weeklyLongMinutes) * 0.85,
  );
  const requiredTotal = sumValues(requiredMinutes);
  const feasibility = requiredTotal > 0 ? availableMinutes / requiredTotal : 1;
  const feasibilityStatus = feasibilityStatusOf(feasibility);
  const phases = buildPhases(input, gaps, totalDays);
  const weeklyFocus = weakestDomain(gaps);
  const dailyPlan = buildDailyMissions(input, gaps, weeklyFocus, phases[0]?.id ?? 'focus');
  const curriculumPlan = phasesToCurriculum(phases, input.specificGoal);

  return {
    feasibility,
    feasibilityStatus,
    feasibilityLabel: feasibilityLabel(feasibilityStatus, Math.round(feasibility * 100)),
    adjustmentHint: adjustmentHintFor(feasibilityStatus),
    gaps,
    requiredMinutes,
    availableMinutes,
    phases,
    curriculumPlan,
    dailyPlan,
    weeklyFocusDomain: weeklyFocus,
  };
}

function scoresToDomains(scores: Record<WeaknessArea, number>): Record<PlannerDomain, number> {
  return {
    prepositions: scores.prepositions,
    retention: scores.retention,
    pronunciation: scores.pronunciation,
    wordOrder: scores.wordOrder,
    listening: scores.grammar,
  };
}

function targetScoresForLevel(pl: number): Record<PlannerDomain, number> {
  const clamped = Math.min(10, Math.max(3, pl));
  return TARGET_BY_PL[clamped];
}

function computeGaps(
  current: Record<PlannerDomain, number>,
  target: Record<PlannerDomain, number>,
): Record<PlannerDomain, number> {
  const gaps = {} as Record<PlannerDomain, number>;
  (Object.keys(current) as PlannerDomain[]).forEach((domain) => {
    gaps[domain] = Math.max(0, target[domain] - current[domain]);
  });
  return gaps;
}

function diminishingFactor(score: number) {
  if (score >= 80) return 0.7;
  if (score >= 65) return 0.85;
  return 1;
}

function computeRequiredMinutes(
  gaps: Record<PlannerDomain, number>,
  current: Record<PlannerDomain, number>,
): Record<PlannerDomain, number> {
  const required = {} as Record<PlannerDomain, number>;
  (Object.keys(gaps) as PlannerDomain[]).forEach((domain) => {
    const rate = LEARNING_RATES[domain];
    const factor = diminishingFactor(current[domain]);
    required[domain] = Math.round((gaps[domain] / Math.max(rate * factor, 0.1)) * 8);
  });
  return required;
}

function buildPhases(input: PlannerInput, gaps: Record<PlannerDomain, number>, totalDays: number): PhasePlan[] {
  const ranked = (Object.keys(gaps) as PlannerDomain[]).sort((a, b) => gaps[b] - gaps[a]);
  const weakest = ranked.slice(0, 2);
  const third = ranked[2] ?? ranked[0];
  const phaseDays = Math.max(7, Math.floor(totalDays / 3));

  if (totalDays < 14) {
    return [
      {
        id: 'focus',
        title: '集中突破',
        duration: `${totalDays}日`,
        focus: DOMAIN_LABELS[weakest[0]],
        domains: [weakest[0]],
        milestone: `${DOMAIN_LABELS[weakest[0]]}のミニ卒業テスト`,
      },
    ];
  }

  return [
    {
      id: 'focus',
      title: 'Phase 1 集中',
      duration: `Day 1-${phaseDays}`,
      focus: `${DOMAIN_LABELS[weakest[0]]}・${DOMAIN_LABELS[weakest[1]]}`,
      domains: weakest,
      milestone: '弱点2領域のミニ卒業テスト',
    },
    {
      id: 'integrate',
      title: 'Phase 2 統合',
      duration: `Day ${phaseDays + 1}-${phaseDays * 2}`,
      focus: `チャンク × ${DOMAIN_LABELS[third]}`,
      domains: ranked,
      milestone: '語順テンプレート実戦チェック',
    },
    {
      id: 'practice',
      title: 'Phase 3 実戦',
      duration: `Day ${phaseDays * 2 + 1}-${totalDays}`,
      focus: input.specificGoal,
      domains: ranked,
      milestone: 'AI会話＋再診断',
    },
  ];
}

function buildDailyMissions(
  input: PlannerInput,
  gaps: Record<PlannerDomain, number>,
  focusDomain: PlannerDomain,
  phase: PlanPhase,
): PlannerMission[] {
  const focusLabel = DOMAIN_LABELS[focusDomain];
  const gap = gaps[focusDomain];
  const morningTitle =
    phase === 'focus'
      ? focusDomain === 'pronunciation'
        ? '音素フォーカス'
        : '単音素シャドーイング'
      : phase === 'integrate'
        ? '文シャドーイング'
        : 'ダイアログシャドーイング';

  const lunchTitle =
    focusDomain === 'prepositions'
      ? '前置詞ビジュアライザー'
      : focusDomain === 'wordOrder'
        ? '語順テンプレート'
        : focusDomain === 'retention'
          ? 'チャンク＋SRS'
          : focusDomain === 'pronunciation'
            ? '発音ドリル'
            : 'リスニング穴埋め';

  const eveningTitle = phase === 'practice' ? 'AIロールプレイ' : '瞬間英作文';

  return [
    {
      id: 'morning',
      timeOfDay: '朝',
      minutes: 5,
      title: morningTitle,
      purpose: '耳と口を英語モードに切り替える',
      phase,
      reason: `今日は${focusLabel}の耳慣らし。短い反復で口から出る準備をします。`,
    },
    {
      id: 'lunch',
      timeOfDay: '昼',
      minutes: 10,
      title: lunchTitle,
      purpose: '新規インプットと運用練習',
      phase,
      reason: `診断で${focusLabel}の伸びしろが${gap}pt。ここを抜けると一気に楽になります。`,
    },
    {
      id: 'evening',
      timeOfDay: '夜',
      minutes: 8,
      title: eveningTitle,
      purpose: 'その日の表現を実戦で使う',
      phase,
      reason: `「${input.specificGoal}」に近づくため、今日学んだ型をアウトプットします。`,
    },
    {
      id: 'bedtime',
      timeOfDay: '寝る前',
      minutes: 2,
      title: 'SRS復習パック',
      purpose: '睡眠前の記憶定着を使う',
      phase,
      reason: '当日触れた表現だけを復習し、忘却曲線に沿って定着させます。',
    },
  ];
}

function phasesToCurriculum(phases: PhasePlan[], specificGoal: string): CurriculumStep[] {
  const head: CurriculumStep = {
    id: 'diagnosis',
    title: 'Goal診断',
    focus: specificGoal,
    outcome: '5領域スコアと弱点マップを可視化',
    duration: 'Day 0',
  };
  return [
    head,
    ...phases.map((phase) => ({
      id: phase.id,
      title: phase.title,
      focus: phase.focus,
      outcome: phase.milestone,
      duration: phase.duration,
    })),
  ];
}

export function inferPlLevelFromGoal(goal: Goal, targetLevel: string, goalType: GoalType): number {
  const text = targetLevel.toLowerCase();
  if (/pl\s*10|ネイティブ|distinction\s*vi/i.test(text)) return 10;
  if (/pl\s*9|distinction\s*v/i.test(text)) return 9;
  if (/pl\s*8|toeic\s*9|英検1|toefl\s*10/i.test(text) || /920|990/.test(text)) return 8;
  if (/pl\s*7|toeic\s*7|750|800/.test(text)) return 7;
  if (/pl\s*6|toeic\s*6|650|700/.test(text)) return 6;
  if (/pl\s*5/.test(text)) return 5;
  if (goalType === 'exam') return 7;
  if (goal === 'work') return 6;
  if (goal === 'travel') return 5;
  return 5;
}

export function domainForWeakness(weakness: WeaknessArea): PlannerDomain {
  return WEAKNESS_TO_DOMAIN[weakness];
}

function feasibilityStatusOf(feasibility: number): FeasibilityStatus {
  if (feasibility < 0.7) return 'shortfall';
  if (feasibility > 1.3) return 'surplus';
  return 'balanced';
}

function feasibilityLabel(status: FeasibilityStatus, pct: number) {
  if (status === 'shortfall') return `達成可能性 ${pct}%（不足）`;
  if (status === 'surplus') return `達成可能性 ${pct}%（余裕）`;
  return `達成可能性 ${pct}%（適正）`;
}

function adjustmentHintFor(status: FeasibilityStatus) {
  if (status === 'shortfall') {
    return '目標を少し緩める・1日の学習時間を増やす・目標日を延ばす、のいずれかを検討できます。';
  }
  if (status === 'surplus') {
    return '余裕があります。到達レベルを一段上げるか、週1回の集中日で深掘りできます。';
  }
  return '現状のペースで、説明可能な逆算プランを作成しました。';
}

function daysUntil(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  return Math.max(1, Math.ceil(diff / 86_400_000));
}

function countRestDays(totalDays: number, restDayOfWeek: number) {
  let count = 0;
  const start = new Date();
  for (let i = 0; i < totalDays; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    if (day.getDay() === restDayOfWeek) count += 1;
  }
  return count;
}

function sumValues(record: Record<string, number>) {
  return Object.values(record).reduce((sum, value) => sum + value, 0);
}

function weakestDomain(gaps: Record<PlannerDomain, number>) {
  return (Object.keys(gaps) as PlannerDomain[]).sort((a, b) => gaps[b] - gaps[a])[0];
}
