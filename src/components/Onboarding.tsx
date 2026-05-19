import { useMemo, useState } from 'react';
import type { Goal, UserProfile, WeaknessArea } from '../types';
import { GOAL_LABELS, WEAKNESS_LABELS } from '../data/scenarios';
import { buildMasterPlan, inferPlLevelFromGoal, type GoalType, type PlannerResult } from '../lib/planner';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const weaknessOptions: WeaknessArea[] = ['prepositions', 'pronunciation', 'wordOrder', 'retention', 'grammar'];
const goalOptions: Goal[] = ['travel', 'work', 'daily', 'exam'];
const goalTypeOptions: { id: GoalType; label: string }[] = [
  { id: 'exam', label: '試験' },
  { id: 'occasion', label: '場面' },
  { id: 'level', label: 'レベル' },
];
const weekdayOptions = [
  { value: 0, label: '日' },
  { value: 1, label: '月' },
  { value: 2, label: '火' },
  { value: 3, label: '水' },
  { value: 4, label: '木' },
  { value: 5, label: '金' },
  { value: 6, label: '土' },
];

const goalPrompts: Record<Goal, string> = {
  travel: '例: 海外旅行でカフェ注文とホテル対応を英語で済ませたい',
  work: '例: 3か月後の会議で自分の担当を2分で説明したい',
  daily: '例: 海外の友人と週末の予定を自然に話したい',
  exam: '例: TOEIC 750点 / 英検面接で理由つき回答',
};

const goalDefaults: Record<Goal, string> = {
  travel: '海外旅行で注文・移動・ホテル対応を英語でできる',
  work: '会議で自己紹介と担当業務を英語で説明できる',
  daily: '日常の予定・好み・困りごとを英語で話せる',
  exam: '面接で意見と理由を英語で組み立てられる',
};

const defaultTargetLevelByGoal: Record<Goal, string> = {
  travel: 'PL5 · 現地で3場面を自力対応',
  work: 'PL6 · 2分説明＋質疑応答',
  daily: 'PL5 · 5分の雑談継続',
  exam: 'PL7 · TOEIC 750相当',
};

type Step = 'goal' | 'target' | 'weakness';

export function Onboarding({ onComplete }: Props) {
  const [name, setName] = useState('Mizutani');
  const [goal, setGoal] = useState<Goal>('travel');
  const [goalType, setGoalType] = useState<GoalType>('occasion');
  const [step, setStep] = useState<Step>('goal');
  const [specificGoal, setSpecificGoal] = useState('');
  const [targetDate, setTargetDate] = useState(defaultTargetDate());
  const [targetLevel, setTargetLevel] = useState('');
  const [restDayOfWeek, setRestDayOfWeek] = useState(0);
  const [weakness, setWeakness] = useState<WeaknessArea>('prepositions');

  const resolvedGoal = specificGoal.trim() || goalDefaults[goal];
  const targetLevelText = targetLevel.trim() || defaultTargetLevelByGoal[goal];
  const targetPlLevel = inferPlLevelFromGoal(goal, targetLevelText, goalType);

  const draftScores = useMemo(
    () => ({
      prepositions: weakness === 'prepositions' ? 42 : 68,
      pronunciation: weakness === 'pronunciation' ? 45 : 64,
      wordOrder: weakness === 'wordOrder' ? 44 : 70,
      retention: weakness === 'retention' ? 40 : 66,
      grammar: weakness === 'grammar' ? 43 : 69,
    }),
    [weakness],
  );

  const planPreview = useMemo(
    () =>
      buildMasterPlan({
        goal,
        goalType,
        specificGoal: resolvedGoal,
        targetDate,
        targetLevel: targetLevelText,
        targetPlLevel,
        dailyMinutes: 25,
        weeklyLongMinutes: 60,
        restDayOfWeek,
        weaknessScores: draftScores,
        primaryWeakness: weakness,
      }),
    [goal, goalType, resolvedGoal, targetDate, targetLevelText, targetPlLevel, restDayOfWeek, draftScores, weakness],
  );

  function submit() {
    const primaryWeakness = weakness || inferWeaknessFromGoal(resolvedGoal, goal);
    const scores = {
      prepositions: primaryWeakness === 'prepositions' ? 42 : 68,
      pronunciation: primaryWeakness === 'pronunciation' ? 45 : 64,
      wordOrder: primaryWeakness === 'wordOrder' ? 44 : 70,
      retention: primaryWeakness === 'retention' ? 40 : 66,
      grammar: primaryWeakness === 'grammar' ? 43 : 69,
    };
    const plan = buildMasterPlan({
      goal,
      goalType,
      specificGoal: resolvedGoal,
      targetDate,
      targetLevel: targetLevelText,
      targetPlLevel,
      dailyMinutes: 25,
      weeklyLongMinutes: 60,
      restDayOfWeek,
      weaknessScores: scores,
      primaryWeakness,
    });

    onComplete({
      name: name.trim() || 'Learner',
      goal,
      targetLanguage: 'en',
      specificGoal: resolvedGoal,
      targetDate,
      targetLevel: targetLevelText,
      curriculumPlan: plan.curriculumPlan,
      dailyPlan: plan.dailyPlan,
      restDayOfWeek,
      dailyMinutes: 25,
      planner: {
        feasibility: plan.feasibility,
        feasibilityStatus: plan.feasibilityStatus,
        feasibilityLabel: plan.feasibilityLabel,
        adjustmentHint: plan.adjustmentHint,
        targetPlLevel,
      },
      weaknessScores: scores,
    });
  }

  function moveToTarget(nextGoal: Goal) {
    setGoal(nextGoal);
    setSpecificGoal((current) => current || goalDefaults[nextGoal]);
    setGoalType(nextGoal === 'exam' ? 'exam' : 'occasion');
    setWeakness(inferWeaknessFromGoal(specificGoal || goalDefaults[nextGoal], nextGoal));
    setStep('target');
  }

  function moveToWeakness() {
    setSpecificGoal(resolvedGoal);
    setWeakness(inferWeaknessFromGoal(resolvedGoal, goal));
    setStep('weakness');
  }

  const stepLabel = step === 'goal' ? '1/3' : step === 'target' ? '2/3' : '3/3';
  const stepTitle = step === 'goal' ? '学習プロフィール' : step === 'target' ? '目標を具体化' : '弱点を確定';

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Polylingo English</p>
        <h1>英語の盲点を、強みに変える。</h1>
        <p className="subtitle">目標から逆算し、なぜ今日これをやるかまで説明する道場型トレーナー。</p>
      </section>

      <section className="card onboarding-card">
        <div className="form-heading">
          <p className="eyebrow">Setup · {stepLabel}</p>
          <h2>{stepTitle}</h2>
        </div>

        {step === 'goal' && (
          <>
            <label>
              呼び名
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <div>
              <p className="label">目的</p>
              <div className="chip-grid goal-grid">
                {goalOptions.map((option) => (
                  <button
                    key={option}
                    className={goal === option ? 'chip goal-chip active' : 'chip goal-chip'}
                    onClick={() => moveToTarget(option)}
                  >
                    {GOAL_LABELS[option]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'target' && (
          <>
            <div className="form-section">
              <p className="label">目標タイプ</p>
              <div className="chip-grid three-grid">
                {goalTypeOptions.map((option) => (
                  <button
                    key={option.id}
                    className={goalType === option.id ? 'chip active' : 'chip'}
                    onClick={() => setGoalType(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <p className="label">具体的な目標</p>
              <textarea
                value={specificGoal}
                placeholder={goalPrompts[goal]}
                onChange={(event) => setSpecificGoal(event.target.value)}
              />
            </div>

            <div className="planner-grid">
              <label>
                目標日
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </label>
              <label>
                到達レベル
                <input
                  value={targetLevel}
                  placeholder={defaultTargetLevelByGoal[goal]}
                  onChange={(e) => setTargetLevel(e.target.value)}
                />
              </label>
            </div>

            <div className="form-section">
              <p className="label">週の休息日</p>
              <div className="chip-grid weekday-grid">
                {weekdayOptions.map((day) => (
                  <button
                    key={day.value}
                    className={restDayOfWeek === day.value ? 'chip active' : 'chip'}
                    onClick={() => setRestDayOfWeek(day.value)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="micro-copy">基本25分/日 ＋ 週1回60分の集中日（バッファ15%込み）</p>
            </div>

            <PlanPreview plan={planPreview} goalLabel={GOAL_LABELS[goal]} pl={targetPlLevel} />

            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep('goal')}>戻る</button>
              <button className="btn btn-primary" onClick={moveToWeakness}>弱点を確認</button>
            </div>
          </>
        )}

        {step === 'weakness' && (
          <>
            <div className="goal-summary">
              <span>{GOAL_LABELS[goal]} · PL{targetPlLevel}</span>
              <strong>{resolvedGoal}</strong>
            </div>

            <div className={`feasibility-banner ${planPreview.feasibilityStatus}`}>
              <strong>{planPreview.feasibilityLabel}</strong>
              <span>{planPreview.adjustmentHint}</span>
            </div>

            <div className="form-section">
              <p className="label">今いちばん潰したい弱点</p>
              <div className="chip-grid">
                {weaknessOptions.map((option) => (
                  <button
                    key={option}
                    className={weakness === option ? 'chip active' : 'chip'}
                    onClick={() => setWeakness(option)}
                  >
                    {WEAKNESS_LABELS[option]}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-block" onClick={submit}>
              逆算カリキュラムを作る
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setStep('target')}>
              目標を直す
            </button>
          </>
        )}
      </section>
    </main>
  );
}

function PlanPreview({ plan, goalLabel, pl }: { plan: PlannerResult; goalLabel: string; pl: number }) {
  return (
    <div className="curriculum-preview">
      <p className="eyebrow">Reverse plan</p>
      <h3>{goalLabel} → PL{pl} へ逆算</h3>
      <p className={`feasibility-inline ${plan.feasibilityStatus}`}>{plan.feasibilityLabel}</p>
      {plan.curriculumPlan.map((item) => (
        <div className="plan-row" key={item.id}>
          <span>{item.duration} · {item.title}</span>
          <small>{item.outcome}</small>
        </div>
      ))}
      <p className="micro-copy">各ミッションには「なぜ今日これか」の1行説明を付けます。</p>
    </div>
  );
}

function inferWeaknessFromGoal(text: string, goal: Goal): WeaknessArea {
  const lower = text.toLowerCase();
  if (/発音|聞き返|通じ|音読|シャドー|pronunciation|speak/.test(text) || lower.includes('pronunciation')) {
    return 'pronunciation';
  }
  if (/前置詞|in |on |at |for |to /.test(text)) return 'prepositions';
  if (/覚え|忘れ|単語|復習|暗記|定着/.test(text)) return 'retention';
  if (/文法|時制|冠詞|疑問|完了|grammar|リスニング|聞き取/.test(text) || goal === 'exam') return 'grammar';
  return 'wordOrder';
}

function defaultTargetDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().slice(0, 10);
}
