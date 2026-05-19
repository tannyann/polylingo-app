import { useCallback, useMemo, useRef, useState } from 'react';
import { PATTERN_LEVEL_LABELS } from '../data/patterns';
import { speak } from '../lib/speech';
import type { Scenario, SentencePattern } from '../types';

interface Props {
  pattern: SentencePattern;
  relatedScenarios: Scenario[];
  onBack: () => void;
  onComplete: (xp: number) => void;
  onStartScenario: (id: string) => void;
}

type Phase = 'intro' | 'drill' | 'done';

export function PatternLesson({ pattern, relatedScenarios, onBack, onComplete, onStartScenario }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [drillIndex, setDrillIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const completionReportedRef = useRef(false);

  const drill = pattern.drills[drillIndex];
  const totalDrills = pattern.drills.length;
  const pickedChoice = useMemo(() => drill?.choices.find((choice) => choice.id === pickedId) ?? null, [drill, pickedId]);
  const progressPct = phase === 'done' ? 100 : Math.round(((drillIndex + (pickedId ? 0.45 : 0)) / Math.max(totalDrills, 1)) * 100);

  const complete = useCallback(() => {
    if (completionReportedRef.current) return;
    completionReportedRef.current = true;
    setPhase('done');
    onComplete(28 + totalDrills * 8);
  }, [onComplete, totalDrills]);

  function handlePick(choiceId: string) {
    if (!drill) return;
    setPickedId(choiceId);
    const choice = drill.choices.find((candidate) => candidate.id === choiceId);
    if (!choice?.isCorrect) return;
    speak(drill.fullSentenceEn);
    window.setTimeout(() => {
      setPickedId(null);
      if (drillIndex >= totalDrills - 1) complete();
      else setDrillIndex((current) => current + 1);
    }, 1200);
  }

  function resetLesson() {
    completionReportedRef.current = false;
    setPhase('intro');
    setDrillIndex(0);
    setPickedId(null);
  }

  return (
    <main className="screen">
      <button type="button" className="btn btn-ghost" onClick={onBack}>戻る</button>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>

      {phase === 'intro' && (
        <section className="card lesson-card">
          <p className="eyebrow">文型 · {PATTERN_LEVEL_LABELS[pattern.level]}レベル</p>
          <h1>{pattern.titleJa}</h1>
          <code className="formula">{pattern.formulaEn}</code>
          <p className="accent-copy">{pattern.glossJa}</p>
          <p>{pattern.explainJa}</p>
          {pattern.pitfallJa && <p className="tip"><strong>日本人の盲点:</strong> {pattern.pitfallJa}</p>}
          <div className="speech-card">
            <span>{pattern.showcaseEn}</span>
            <small>{pattern.showcaseJa}</small>
            <button className="btn btn-ghost" onClick={() => speak(pattern.showcaseEn)}>音声を聞く</button>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => setPhase('drill')}>ドリルを始める</button>
        </section>
      )}

      {phase === 'drill' && drill && (
        <section className="card lesson-card">
          <p className="eyebrow">ドリル {drillIndex + 1} / {totalDrills}</p>
          <h1>{drill.cueJa}</h1>
          <p className="section-copy">一番自然な英文を選んでください。</p>
          <div className="choice-list">
            {drill.choices.map((choice) => (
              <button
                key={choice.id}
                className="choice"
                disabled={Boolean(pickedChoice?.isCorrect)}
                onClick={() => handlePick(choice.id)}
              >
                {choice.text}
              </button>
            ))}
          </div>
          {pickedChoice && (
            <div className={pickedChoice.isCorrect ? 'feedback good' : 'feedback'}>
              {pickedChoice.isCorrect ? (
                <>
                  <strong>{drill.fullSentenceEn}</strong>
                  <span>{drill.fullSentenceJa}</span>
                </>
              ) : (
                pickedChoice.tipJa
              )}
            </div>
          )}
        </section>
      )}

      {phase === 'done' && (
        <section className="card lesson-card">
          <h1>文型クリア</h1>
          <p>この型をシナリオ会話で使える状態に近づけました。</p>
          {relatedScenarios[0] && (
            <button className="btn btn-secondary btn-block" onClick={() => onStartScenario(relatedScenarios[0].id)}>
              会話で使う: {relatedScenarios[0].titleJa}
            </button>
          )}
          <button className="btn btn-primary btn-block" onClick={resetLesson}>もう一度</button>
          <button className="btn btn-ghost btn-block" onClick={onBack}>ホームへ</button>
        </section>
      )}
    </main>
  );
}
