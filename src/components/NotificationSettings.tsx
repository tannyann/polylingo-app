import { useState } from 'react';
import type { NotificationPreferences, NotificationSlot, UserProfile } from '../types';
import {
  buildInvitation,
  DEFAULT_NOTIFICATION_PREFS,
  notificationSupported,
  requestNotificationPermission,
  saveNotificationPrefs,
} from '../lib/invitationNotifications';

const SLOT_OPTIONS: { id: NotificationSlot; label: string; hint: string }[] = [
  { id: 'morning', label: '朝', hint: 'シャドーイングの招待' },
  { id: 'lunch', label: '昼', hint: '弱点ドリルの招待' },
  { id: 'evening', label: '夜', hint: 'アウトプットの招待' },
  { id: 'bedtime', label: '寝る前', hint: 'SRS定着の招待' },
];

interface Props {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export function NotificationSettings({ profile, onUpdate }: Props) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    profile.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS,
  );
  const [status, setStatus] = useState<string | null>(null);
  const supported = notificationSupported();

  function persist(next: NotificationPreferences) {
    setPrefs(next);
    saveNotificationPrefs(next);
    onUpdate({ ...profile, notificationPrefs: next });
  }

  async function enableNotifications() {
    if (!supported) {
      setStatus('このブラウザでは通知を使えません。');
      return;
    }
    const permission = await requestNotificationPermission();
    if (permission === 'denied') {
      setStatus('通知がブロックされています。ブラウザ設定から許可してください。');
      return;
    }
    if (permission !== 'granted') {
      setStatus('通知の許可が必要です。');
      return;
    }
    persist({ ...prefs, enabled: true });
    setStatus('招待型リマインドをオンにしました。煽りや罪悪感の文言は使いません。');
  }

  function toggleSlot(slot: NotificationSlot) {
    persist({
      ...prefs,
      slots: { ...prefs.slots, [slot]: !prefs.slots[slot] },
    });
  }

  function updateTime(slot: NotificationSlot, value: string) {
    persist({
      ...prefs,
      slotTimes: { ...prefs.slotTimes, [slot]: value },
    });
  }

  function sendTestNotification() {
    if (Notification.permission !== 'granted') return;
    const mission = profile.dailyPlan?.find((item) => item.id === 'lunch');
    const { title, body } = buildInvitation('lunch', mission, profile, false);
    new Notification(title, { body, tag: 'polylingo-test' });
    setStatus('テスト通知を送りました。実際の通知も同じトーンです。');
  }

  return (
    <section className="notification-card">
      <div>
        <p className="eyebrow">招待型リマインド</p>
        <h2>予定ではなく、招待。</h2>
        <p className="section-copy">
          道場メニューの時間帯に合わせ、「なぜ今日これか」を添えた短い通知だけ送ります。未達成の責めはしません。
        </p>
      </div>

      {!supported && <p className="micro-copy">通知 API 非対応の環境です（Safari 以外の最新ブラウザを推奨）。</p>}

      {supported && (
        <>
          <div className="notification-toggle-row">
            <button
              type="button"
              className={prefs.enabled ? 'btn btn-primary' : 'btn btn-ghost'}
              onClick={() => (prefs.enabled ? persist({ ...prefs, enabled: false }) : enableNotifications())}
            >
              {prefs.enabled ? '通知オン（タップでオフ）' : '通知を許可してオンにする'}
            </button>
          </div>

          {prefs.enabled && (
            <>
            <div className="notification-slots">
              {SLOT_OPTIONS.map((slot) => (
                <div className="notification-slot" key={slot.id}>
                  <label className="slot-label">
                    <input
                      type="checkbox"
                      checked={prefs.slots[slot.id]}
                      onChange={() => toggleSlot(slot.id)}
                    />
                    <span>
                      <strong>{slot.label}</strong>
                      <small>{slot.hint}</small>
                    </span>
                  </label>
                  <input
                    type="time"
                    value={prefs.slotTimes[slot.id]}
                    onChange={(e) => updateTime(slot.id, e.target.value)}
                    disabled={!prefs.slots[slot.id]}
                  />
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-ghost" onClick={sendTestNotification}>
              テスト通知を送る
            </button>
            </>
          )}

          {status && <p className="micro-copy">{status}</p>}
        </>
      )}
    </section>
  );
}
