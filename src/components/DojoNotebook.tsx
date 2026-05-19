import type { SessionStats } from '../types';

interface Props {
  stats: SessionStats;
  missionCount: number;
  completedToday: number;
}

export function DojoNotebook({ stats, missionCount, completedToday }: Props) {
  const days = buildLastDays(14, stats.rhythmDays);
  const todayProgress = missionCount > 0 ? Math.round((completedToday / missionCount) * 100) : 0;

  return (
    <section className="dojo-notebook-card">
      <div>
        <p className="eyebrow">My道場手帳</p>
        <h2>過去は墨、今日はミッション</h2>
        <p className="section-copy">ストリーク数字ではなく、手帳に印を押す達成感。未来の予定は薄く、確定すると濃くなります。</p>
      </div>
      <div className="notebook-grid">
        <div>
          <p className="label">過去14日</p>
          <div className="ink-days">
            {days.map((day) => (
              <span key={day.date} className={day.done ? 'ink filled' : 'ink'} title={day.date} />
            ))}
          </div>
        </div>
        <div>
          <p className="label">今日</p>
          <strong className="today-progress">{todayProgress}%</strong>
          <small>道場メニュー {completedToday}/{missionCount}</small>
        </div>
        <div>
          <p className="label">未来</p>
          <p className="future-hint">プランナーが描いた予定が、ここに薄く並びます。</p>
        </div>
      </div>
    </section>
  );
}

function buildLastDays(count: number, rhythmDays: string[]) {
  const out: { date: string; done: boolean }[] = [];
  const cursor = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, done: rhythmDays.includes(key) });
  }
  return out;
}
