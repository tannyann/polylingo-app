import { useState } from 'react';
import { speak } from '../lib/speech';
import type { Scenario } from '../types';

interface Props {
  scenario: Scenario;
  onBack: () => void;
  onComplete: (xp: number) => void;
}

export function ScenarioLesson({ scenario, onBack, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const line = scenario.lines[index];
  const isLast = index >= scenario.lines.length - 1;
  const progress = Math.round(((index + 1) / scenario.lines.length) * 100);

  function advance() {
    if (isLast) onComplete(40 + scenario.difficulty * 10);
    else setIndex((current) => current + 1);
  }

  return (
    <main className="screen">
      <button type="button" className="btn btn-ghost" onClick={onBack}>戻る</button>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <section className="card lesson-card">
        <p className="eyebrow">{scenario.title}</p>
        <h1>{scenario.titleJa}</h1>
        <div className={line.speaker === 'partner' ? 'bubble partner' : 'bubble learner'}>
          <strong>{line.text}</strong>
          <span>{line.ja}</span>
        </div>
        {line.hint && <p className="tip">{line.hint}</p>}
        <div className="lesson-actions">
          <button className="btn btn-secondary" onClick={() => speak(line.text)}>音声</button>
          <button className="btn btn-primary" onClick={advance}>{isLast ? '完了' : '次へ'}</button>
        </div>
      </section>
    </main>
  );
}
