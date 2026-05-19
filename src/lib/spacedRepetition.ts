import type { VocabCard } from '../types';

export function dueCards(cards: VocabCard[], now = new Date()): VocabCard[] {
  return cards.filter((card) => new Date(card.dueAt) <= now);
}

export function reviewCard(card: VocabCard, quality: 'again' | 'good' | 'easy'): VocabCard {
  const next = { ...card, reviews: card.reviews + 1 };
  if (quality === 'again') {
    next.interval = 1;
    next.ease = Math.max(1.3, next.ease - 0.25);
  } else if (quality === 'easy') {
    next.interval = Math.max(2, Math.round(next.interval * next.ease * 1.4));
    next.ease += 0.15;
  } else {
    next.interval = Math.max(2, Math.round(next.interval * next.ease));
  }

  const due = new Date();
  due.setDate(due.getDate() + next.interval);
  next.dueAt = due.toISOString();
  return next;
}

export function memoryStrength(card: VocabCard): number {
  const due = new Date(card.dueAt).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((due - now) / 86_400_000));
  return Math.min(100, Math.round((daysLeft / Math.max(card.interval, 1)) * 70 + card.reviews * 8));
}
