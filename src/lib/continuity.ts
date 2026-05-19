import type { SessionStats } from '../types';

export function daysSinceLastActive(stats: SessionStats) {
  const last = new Date(stats.lastActiveDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - last.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

export function shouldShowRescheduler(stats: SessionStats, dismissedAt?: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (dismissedAt === today) return false;
  return daysSinceLastActive(stats) >= 3;
}
