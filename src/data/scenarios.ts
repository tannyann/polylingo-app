import type { Goal, Scenario, WeaknessArea } from '../types';

export const GOAL_LABELS: Record<Goal, string> = {
  travel: '旅行',
  work: '仕事',
  daily: '日常会話',
  exam: '試験・面接',
};

export const WEAKNESS_LABELS: Record<WeaknessArea, string> = {
  prepositions: '前置詞',
  pronunciation: '発音',
  wordOrder: '語順',
  retention: '定着',
  grammar: '文法',
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'cafe-order',
    title: 'Cafe Order',
    titleJa: 'カフェで自然に注文する',
    goalTags: ['travel', 'daily'],
    weaknessTags: ['prepositions', 'pronunciation', 'wordOrder'],
    difficulty: 1,
    summaryJa: 'I would like / for here / to go を使って、短く丁寧に注文します。',
    lines: [
      { speaker: 'partner', text: 'Hi, what can I get for you?', ja: 'こんにちは。ご注文は？' },
      {
        speaker: 'learner',
        text: "I'd like a medium latte, please.",
        ja: 'ミディアムのラテをお願いします。',
        hint: "want より I'd like が店では自然です。",
      },
      { speaker: 'partner', text: 'Sure. For here or to go?', ja: 'かしこまりました。店内ですか、お持ち帰りですか？' },
      {
        speaker: 'learner',
        text: 'For here, please.',
        ja: '店内でお願いします。',
        hint: '場所の here ではなく、定型の for here と覚えます。',
      },
    ],
    vocab: [
      {
        id: 'v-id-like',
        front: "I'd like ...",
        backJa: '〜をお願いします',
        example: "I'd like a medium latte, please.",
        weaknessTag: 'grammar',
        interval: 1,
        ease: 2.5,
        dueAt: new Date().toISOString(),
        reviews: 0,
      },
      {
        id: 'v-for-here',
        front: 'For here',
        backJa: '店内で',
        example: 'For here, please.',
        weaknessTag: 'prepositions',
        interval: 1,
        ease: 2.5,
        dueAt: new Date().toISOString(),
        reviews: 0,
      },
    ],
  },
  {
    id: 'airport-checkin',
    title: 'Airport Check-in',
    titleJa: '空港チェックイン',
    goalTags: ['travel'],
    weaknessTags: ['wordOrder', 'pronunciation'],
    difficulty: 2,
    summaryJa: '便名、座席希望、荷物預けを落ち着いて伝えます。',
    lines: [
      { speaker: 'partner', text: 'May I see your passport?', ja: 'パスポートを拝見できますか？' },
      {
        speaker: 'learner',
        text: "I'm checking in for flight JL405.",
        ja: 'JL405便のチェックインです。',
        hint: "I'm checking in for flight ... が型です。",
      },
      { speaker: 'partner', text: 'Would you like a window or aisle seat?', ja: '窓側と通路側、どちらがよいですか？' },
      {
        speaker: 'learner',
        text: 'Could I have an aisle seat?',
        ja: '通路側の席をお願いできますか？',
        hint: 'Could I have は丁寧な依頼です。',
      },
    ],
    vocab: [
      {
        id: 'v-check-in',
        front: "I'm checking in for ...",
        backJa: '〜のチェックインです',
        example: "I'm checking in for flight JL405.",
        weaknessTag: 'wordOrder',
        interval: 1,
        ease: 2.5,
        dueAt: new Date().toISOString(),
        reviews: 0,
      },
    ],
  },
  {
    id: 'meeting-intro',
    title: 'Meeting Intro',
    titleJa: '仕事で担当を説明する',
    goalTags: ['work', 'exam'],
    weaknessTags: ['prepositions', 'grammar', 'retention'],
    difficulty: 3,
    summaryJa: '自己紹介から担当範囲まで、英語の語順で言い切ります。',
    lines: [
      { speaker: 'partner', text: 'Could you introduce yourself?', ja: '自己紹介をお願いできますか？' },
      {
        speaker: 'learner',
        text: "Nice to meet you. I'm Ken from the Tokyo office.",
        ja: 'はじめまして。東京オフィスのケンです。',
        hint: "I'm ... from ... で所属まで出します。",
      },
      { speaker: 'partner', text: 'What are you responsible for?', ja: '何を担当していますか？' },
      {
        speaker: 'learner',
        text: "I'm responsible for managing the project timeline.",
        ja: 'プロジェクトのスケジュール管理を担当しています。',
        hint: 'responsible の前置詞は for です。',
      },
    ],
    vocab: [
      {
        id: 'v-responsible-for',
        front: 'responsible for',
        backJa: '〜を担当している',
        example: "I'm responsible for managing the project timeline.",
        weaknessTag: 'prepositions',
        interval: 1,
        ease: 2.5,
        dueAt: new Date().toISOString(),
        reviews: 0,
      },
    ],
  },
];
