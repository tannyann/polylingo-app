import { WEAKNESS_LABELS } from '../data/scenarios';
import { memoryStrength } from '../lib/spacedRepetition';
import type { SessionStats, UserProfile, VocabCard, WeaknessArea } from '../types';

interface Props {
  profile: UserProfile;
  stats: SessionStats;
  vocab: VocabCard[];
  onBack: () => void;
}

const weaknessOrder: WeaknessArea[] = ['prepositions', 'pronunciation', 'wordOrder', 'retention', 'grammar'];

export function ProgressView({ profile, stats, vocab, onBack }: Props) {
  const avgMemory = vocab.length ? Math.round(vocab.reduce((sum, card) => sum + memoryStrength(card), 0) / vocab.length) : 0;

  return (
    <main className="screen">
      <button className="btn btn-ghost" onClick={onBack}>戻る</button>
      <section className="card lesson-card">
        <p className="eyebrow">Weakness map</p>
        <h1>弱点マップ</h1>
        <div className="stats-grid">
          <div className="stat-box"><strong>{stats.totalXp}</strong><span>XP</span></div>
          <div className="stat-box"><strong>{stats.patternsCompleted.length}</strong><span>習得文型</span></div>
          <div className="stat-box"><strong>{stats.scenariosCompleted.length}</strong><span>完了シナリオ</span></div>
          <div className="stat-box"><strong>{avgMemory}%</strong><span>記憶強度</span></div>
        </div>
        <div className="weakness-bars">
          {weaknessOrder.map((key) => (
            <div key={key} className="weakness-row">
              <span>{WEAKNESS_LABELS[key]}</span>
              <div className="bar"><div style={{ width: `${profile.weaknessScores[key]}%` }} /></div>
              <strong>{profile.weaknessScores[key]}%</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
