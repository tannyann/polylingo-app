import { useState } from 'react';
import type { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export function TomorrowNote({ profile, onSave }: Props) {
  const [text, setText] = useState(profile.tomorrowNoteDraft ?? '');
  const saved = profile.tomorrowNoteSaved;

  function save() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const today = new Date().toISOString().slice(0, 10);
    onSave({
      ...profile,
      tomorrowNoteDraft: trimmed,
      tomorrowNoteSaved: today,
    });
    setText('');
  }

  return (
    <section className="tomorrow-card">
      <div>
        <p className="eyebrow">明日への一言</p>
        <h2>今日の自分から、明日の自分へ</h2>
        <p className="section-copy">30秒のメモが、翌朝コーチからの返信つきで届きます（手帳に蓄積）。</p>
      </div>
      {profile.tomorrowNoteLastShown && (
        <blockquote className="coach-reply">
          <p className="eyebrow">道場より</p>
          <p>昨日のあなた: 「{profile.tomorrowNoteLastShown}」— 今日もその一歩を続けましょう。</p>
        </blockquote>
      )}
      {saved === new Date().toISOString().slice(0, 10) ? (
        <p className="micro-copy">今日の一言は保存済みです。また明日。</p>
      ) : (
        <>
          <textarea
            className="tomorrow-input"
            rows={2}
            placeholder="例: 明日は前置詞の in/on を1問だけでも口に出す"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={save} disabled={!text.trim()}>
            明日の自分へ送る
          </button>
        </>
      )}
    </section>
  );
}
