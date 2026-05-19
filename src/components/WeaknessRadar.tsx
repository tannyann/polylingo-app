import { WEAKNESS_LABELS } from '../data/scenarios';
import type { WeaknessArea } from '../types';

const order: WeaknessArea[] = ['prepositions', 'pronunciation', 'wordOrder', 'retention', 'grammar'];

interface Props {
  scores: Record<WeaknessArea, number>;
}

export function WeaknessRadar({ scores }: Props) {
  const ranked = [...order].sort((a, b) => scores[a] - scores[b]);
  const weakest = ranked[0];

  return (
    <section className="radar-card">
      <div>
        <p className="eyebrow">Blind spot map</p>
        <h2>弱点マップ</h2>
        <p className="section-copy">中級者が求めるのは新しい知識ではなく、弱点の見える化と潰す道筋です。</p>
      </div>
      <div className="weakness-bars">
        {order.map((key) => (
          <div className="weakness-row" key={key}>
            <span>{WEAKNESS_LABELS[key]}</span>
            <div className="bar">
              <div style={{ width: `${scores[key]}%` }} />
            </div>
            <strong>{scores[key]}</strong>
          </div>
        ))}
      </div>
      <p className="micro-copy">
        いま一番の伸びしろ: <strong>{WEAKNESS_LABELS[weakest]}</strong> — 今日の道場メニューはここから。
      </p>
    </section>
  );
}
