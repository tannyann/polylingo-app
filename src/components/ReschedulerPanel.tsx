import { useState } from 'react';
import type { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  missedDays: number;
  onChoose: (choice: 'compress' | 'extend' | 'reset', profile: UserProfile) => void;
  onDismiss: () => void;
}

export function ReschedulerPanel({ profile, missedDays, onChoose, onDismiss }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  function apply(choice: 'compress' | 'extend' | 'reset') {
    let next = { ...profile };
    if (choice === 'extend' && profile.targetDate) {
      const d = new Date(profile.targetDate);
      d.setDate(d.getDate() + 7);
      next = { ...next, targetDate: d.toISOString().slice(0, 10) };
      setMessage('目標日を1週間延長しました。無理のないペースで戻りましょう。');
    } else if (choice === 'compress') {
      setMessage('残り日数で巻き返すプランに切り替えました。負荷は上がりますが、師範が伴走します。');
    } else {
      setMessage('ペースを仕切り直しました。今日から新しい一歩を選びましょう。');
    }
    onChoose(choice, next);
  }

  return (
    <section className="rescheduler-card">
      <p className="eyebrow">動的リスケジューラ</p>
      <h2>{missedDays}日空きましたね。次の一歩、選びますか？</h2>
      <p className="section-copy">失敗を取り戻すのではなく、次の選択肢を選ぶ設計です。</p>
      <div className="rescheduler-options">
        <button type="button" className="card row-card" onClick={() => apply('compress')}>
          <strong>圧縮</strong>
          <span>残り日数で巻き返す（本気モード）</span>
        </button>
        <button type="button" className="card row-card" onClick={() => apply('extend')}>
          <strong>延長</strong>
          <span>目標日を1週間後ろにずらす</span>
        </button>
        <button type="button" className="card row-card" onClick={() => apply('reset')}>
          <strong>仕切り直し</strong>
          <span>ペースを再設定して再スタート</span>
        </button>
      </div>
      {message && <p className="micro-copy">{message}</p>}
      <button type="button" className="btn btn-ghost" onClick={onDismiss}>
        あとで決める
      </button>
    </section>
  );
}
