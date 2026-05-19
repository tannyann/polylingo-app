import { useEffect } from 'react';
import { GOAL_LABELS, SCENARIOS, WEAKNESS_LABELS } from '../data/scenarios';
import { PATTERN_LEVEL_LABELS, patternsForGoal } from '../data/patterns';
import { daysSinceLastActive, shouldShowRescheduler } from '../lib/continuity';
import { dueCards } from '../lib/spacedRepetition';
import { DojoNotebook } from './DojoNotebook';
import { NotificationSettings } from './NotificationSettings';
import { ReschedulerPanel } from './ReschedulerPanel';
import { TomorrowNote } from './TomorrowNote';
import { WeaknessRadar } from './WeaknessRadar';
import type { CurriculumStep, DailyMission, Scenario, SentencePattern, SessionStats, UserProfile, VocabCard, WeaknessArea } from '../types';

interface Props {
  profile: UserProfile;
  stats: SessionStats;
  vocab: VocabCard[];
  onStartScenario: (id: string) => void;
  onStartPattern: (id: string) => void;
  onReview: () => void;
  onProgress: () => void;
  onEditProfile: () => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

const weaknessOrder: WeaknessArea[] = ['prepositions', 'pronunciation', 'wordOrder', 'retention', 'grammar'];

export function Home({ profile, stats, vocab, onStartScenario, onStartPattern, onReview, onProgress, onEditProfile, onProfileUpdate }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const missionCount = profile.dailyPlan?.length ?? 3;
  const completedToday = stats.lastActiveDate === today ? Math.min(missionCount, 1 + stats.patternsCompleted.length % missionCount) : 0;
  const missedDays = daysSinceLastActive(stats);
  const showRescheduler = shouldShowRescheduler(stats, profile.reschedulerDismissedAt);

  useEffect(() => {
    if (profile.tomorrowNoteDraft && profile.tomorrowNoteSaved && profile.tomorrowNoteSaved < today) {
      onProfileUpdate({
        ...profile,
        tomorrowNoteLastShown: profile.tomorrowNoteDraft,
        tomorrowNoteDraft: undefined,
        tomorrowNoteSaved: undefined,
      });
    }
  }, [profile, today, onProfileUpdate]);

  const due = dueCards(vocab);
  const sortedScenarios = [...SCENARIOS].sort((a, b) => {
    const aMatch = a.goalTags.includes(profile.goal) ? 0 : 1;
    const bMatch = b.goalTags.includes(profile.goal) ? 0 : 1;
    return aMatch - bMatch || b.difficulty - a.difficulty;
  });
  const patternList = patternsForGoal(profile.goal);
  const dailyMissions = weaknessOrder.slice(0, 3);

  return (
    <main className="screen">
      <div className="topbar">
        <div>
          <p className="eyebrow">おかえりなさい</p>
          <h1>{profile.name}さん</h1>
          <p className="subtitle">目的: {GOAL_LABELS[profile.goal]} · 今日も弱点から1つ潰しましょう</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={onEditProfile}>再設定</button>
          <button className="btn btn-ghost" onClick={onProgress}>進捗</button>
        </div>
      </div>

      {showRescheduler && (
        <ReschedulerPanel
          profile={profile}
          missedDays={missedDays}
          onChoose={(_, next) => onProfileUpdate(next)}
          onDismiss={() => onProfileUpdate({ ...profile, reschedulerDismissedAt: today })}
        />
      )}

      <WeaknessRadar scores={profile.weaknessScores} />

      {profile.specificGoal && (
        <section className="goal-card">
          <p className="eyebrow">Target</p>
          <h2>{profile.specificGoal}</h2>
          <div className="target-meta">
            {profile.targetDate && <span>目標日: {profile.targetDate}</span>}
            {profile.targetLevel && <span>到達: {profile.targetLevel}</span>}
            {profile.planner && (
              <span className={`feasibility-tag ${profile.planner.feasibilityStatus}`}>
                {profile.planner.feasibilityLabel}
              </span>
            )}
          </div>
          {profile.planner?.adjustmentHint && <p className="micro-copy">{profile.planner.adjustmentHint}</p>}
          {profile.curriculumPlan && <CurriculumStrip items={profile.curriculumPlan} />}
        </section>
      )}

      <section className="mission-card">
        <div>
          <p className="eyebrow">My dojo planner</p>
          <h2>今日の道場メニュー</h2>
        </div>
        {profile.dailyPlan ? <DailyPlanGrid items={profile.dailyPlan} /> : (
          <div className="mission-grid">
            {dailyMissions.map((key) => (
              <div className="mini-card" key={key}>
                <span>{WEAKNESS_LABELS[key]}</span>
                <strong>{profile.weaknessScores[key]}%</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <DojoNotebook stats={stats} missionCount={missionCount} completedToday={completedToday} />

      <NotificationSettings profile={profile} onUpdate={onProfileUpdate} />

      <TomorrowNote profile={profile} onSave={onProfileUpdate} />

      {due.length > 0 && (
        <button type="button" className="card review-cta" onClick={onReview}>
          <strong>{due.length}件の復習が待っています</strong>
          <span>SRSで忘れる直前に戻します</span>
        </button>
      )}

      <section>
        <h2>文型ドリル</h2>
        <p className="section-copy">日本語で理解し、英文の型を選択ドリルで固めます。</p>
        <div className="stack">
          {patternList.map((pattern) => (
            <PatternRow
              key={pattern.id}
              pattern={pattern}
              done={stats.patternsCompleted.includes(pattern.id)}
              onStart={() => onStartPattern(pattern.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2>シナリオ会話</h2>
        <div className="stack">
          {sortedScenarios.map((scenario) => (
            <ScenarioRow
              key={scenario.id}
              scenario={scenario}
              done={stats.scenariosCompleted.includes(scenario.id)}
              onStart={() => onStartScenario(scenario.id)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function CurriculumStrip({ items }: { items: CurriculumStep[] }) {
  return (
    <div className="curriculum-strip">
      {items.map((item) => (
        <div className="curriculum-step" key={item.id}>
          <span>{item.duration} · {item.title}</span>
          <small>{item.outcome}</small>
        </div>
      ))}
    </div>
  );
}

function DailyPlanGrid({ items }: { items: DailyMission[] }) {
  return (
    <div className="dojo-grid">
      {items.map((item) => (
        <div className="dojo-card" key={item.id}>
          <span>{item.timeOfDay} · {item.minutes}分</span>
          <strong>{item.title}</strong>
          <small>{item.purpose}</small>
          {item.reason && <p className="mission-reason">{item.reason}</p>}
        </div>
      ))}
    </div>
  );
}

function PatternRow({ pattern, done, onStart }: { pattern: SentencePattern; done: boolean; onStart: () => void }) {
  return (
    <button type="button" className="card row-card" onClick={onStart}>
      <div>
        <div className="row-title">{pattern.titleJa}</div>
        <code>{pattern.formulaEn}</code>
        <p>{pattern.glossJa}</p>
        <div className="tags">
          {done && <span className="tag done">練習済み</span>}
          <span className="tag">{PATTERN_LEVEL_LABELS[pattern.level]}</span>
          <span className="tag">{pattern.drills.length}問</span>
        </div>
      </div>
    </button>
  );
}

function ScenarioRow({ scenario, done, onStart }: { scenario: Scenario; done: boolean; onStart: () => void }) {
  return (
    <button type="button" className="card row-card" onClick={onStart}>
      <div>
        <div className="row-title">{scenario.titleJa}</div>
        <p>{scenario.summaryJa}</p>
        <div className="tags">
          {done && <span className="tag done">完了</span>}
          <span className="tag">Lv.{scenario.difficulty}</span>
          {scenario.weaknessTags.map((tag) => <span key={tag} className="tag">{WEAKNESS_LABELS[tag]}</span>)}
        </div>
      </div>
    </button>
  );
}
