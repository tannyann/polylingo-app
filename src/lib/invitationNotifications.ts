import type { DailyMission, NotificationPreferences, NotificationSlot, UserProfile } from '../types';

const SENT_KEY = 'polylingo:notification-sent';
const PREFS_KEY = 'polylingo:notification-prefs';

const SLOT_TO_MISSION: Record<NotificationSlot, string> = {
  morning: 'morning',
  lunch: 'lunch',
  evening: 'evening',
  bedtime: 'bedtime',
};

const SLOT_LABELS: Record<NotificationSlot, string> = {
  morning: '朝',
  lunch: '昼',
  evening: '夜',
  bedtime: '寝る前',
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: false,
  slots: { morning: true, lunch: true, evening: false, bedtime: true },
  slotTimes: { morning: '07:30', lunch: '12:30', evening: '20:00', bedtime: '22:30' },
};

export function loadNotificationPrefs(): NotificationPreferences {
  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) return { ...DEFAULT_NOTIFICATION_PREFS };
  return { ...DEFAULT_NOTIFICATION_PREFS, ...(JSON.parse(raw) as NotificationPreferences) };
}

export function saveNotificationPrefs(prefs: NotificationPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function mergeNotificationPrefs(profile: UserProfile): UserProfile {
  if (profile.notificationPrefs) return profile;
  return { ...profile, notificationPrefs: loadNotificationPrefs() };
}

export function notificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function buildInvitation(
  slot: NotificationSlot,
  mission: DailyMission | undefined,
  profile: UserProfile,
  isRestDay: boolean,
): { title: string; body: string } {
  if (isRestDay) {
    return {
      title: '今日は休息日',
      body: `${profile.name}さん、無理に詰め込まなくて大丈夫。軽いシャドーイングだけでも歓迎です。`,
    };
  }

  const label = SLOT_LABELS[slot];
  if (!mission) {
    return {
      title: `${label}の道場、少しだけ`,
      body: '今日のミッションが用意されています。開いて次の一歩を選びましょう。',
    };
  }

  const titles: Record<NotificationSlot, string> = {
    morning: `${label}${mission.minutes}分 — 耳と口を英語モードへ`,
    lunch: `${label}${mission.minutes}分 — ${mission.title}`,
    evening: `${label}${mission.minutes}分 — 話す時間です`,
    bedtime: `${label}${mission.minutes}分 — 今日の定着を`,
  };

  return {
    title: titles[slot],
    body: mission.reason ?? mission.purpose,
  };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function sentToday(slot: NotificationSlot) {
  const raw = localStorage.getItem(SENT_KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  const day = todayKey();
  return map[day]?.includes(slot) ?? false;
}

function markSent(slot: NotificationSlot) {
  const raw = localStorage.getItem(SENT_KEY);
  const map = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  const day = todayKey();
  const slots = map[day] ?? [];
  if (!slots.includes(slot)) map[day] = [...slots, slot];
  localStorage.setItem(SENT_KEY, JSON.stringify(map));
}

function isRestDay(profile: UserProfile) {
  if (profile.restDayOfWeek === undefined) return false;
  return new Date().getDay() === profile.restDayOfWeek;
}

function matchesSlotTime(time: string, now: Date) {
  const [h, m] = time.split(':').map(Number);
  return now.getHours() === h && now.getMinutes() === m;
}

function missionForSlot(profile: UserProfile, slot: NotificationSlot): DailyMission | undefined {
  const missionId = SLOT_TO_MISSION[slot];
  return profile.dailyPlan?.find((item) => item.id === missionId);
}

export function tickInvitationNotifications(profile: UserProfile) {
  const prefs = profile.notificationPrefs ?? loadNotificationPrefs();
  if (!prefs.enabled || Notification.permission !== 'granted') return;

  const now = new Date();
  const rest = isRestDay(profile);

  (Object.keys(prefs.slots) as NotificationSlot[]).forEach((slot) => {
    if (!prefs.slots[slot] || sentToday(slot)) return;
    if (!matchesSlotTime(prefs.slotTimes[slot], now)) return;

    const mission = missionForSlot(profile, slot);
    if (rest && slot !== 'morning') return;

    const { title, body } = buildInvitation(slot, mission, profile, rest);
    new Notification(title, {
      body,
      tag: `polylingo-${todayKey()}-${slot}`,
      icon: '/vite.svg',
    });
    markSent(slot);
  });
}
