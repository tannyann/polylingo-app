import { useState } from 'react';
import { reviewCard } from '../lib/spacedRepetition';
import { speak } from '../lib/speech';
import type { VocabCard } from '../types';

interface Props {
  cards: VocabCard[];
  onBack: () => void;
  onUpdate: (cards: VocabCard[]) => void;
}

export function Review({ cards, onBack, onUpdate }: Props) {
  const [queue, setQueue] = useState(cards);
  const card = queue[0];

  function grade(quality: 'again' | 'good' | 'easy') {
    if (!card) return;
    const reviewed = reviewCard(card, quality);
    const rest = queue.slice(1);
    setQueue(rest);
    onUpdate([reviewed, ...cards.filter((candidate) => candidate.id !== reviewed.id)]);
  }

  if (!card) {
    return (
      <main className="screen">
        <section className="card lesson-card">
          <h1>復習完了</h1>
          <p>今日のSRSキューは空です。</p>
          <button className="btn btn-primary btn-block" onClick={onBack}>ホームへ</button>
        </section>
      </main>
    );
  }

  return (
    <main className="screen">
      <button className="btn btn-ghost" onClick={onBack}>戻る</button>
      <section className="card lesson-card">
        <p className="eyebrow">SRS Review</p>
        <h1>{card.front}</h1>
        <p className="accent-copy">{card.backJa}</p>
        <div className="speech-card">
          <span>{card.example}</span>
          <button className="btn btn-ghost" onClick={() => speak(card.example)}>音声</button>
        </div>
        <div className="lesson-actions">
          <button className="btn btn-ghost" onClick={() => grade('again')}>もう一度</button>
          <button className="btn btn-secondary" onClick={() => grade('good')}>覚えた</button>
          <button className="btn btn-primary" onClick={() => grade('easy')}>簡単</button>
        </div>
      </section>
    </main>
  );
}
