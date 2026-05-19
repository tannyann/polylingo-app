import type { Goal, PatternLevel, SentencePattern } from '../types';

export const PATTERN_LEVEL_LABELS: Record<PatternLevel, string> = {
  'junior-high-1': '中1',
  'junior-high-2': '中2',
  'junior-high-3': '中3',
  'high-school': '高校',
};

export const PATTERNS: SentencePattern[] = [
  {
    id: 'pat-for-here',
    titleJa: '店内／持ち帰り: For here / To go',
    level: 'junior-high-1',
    order: 10,
    formulaEn: 'For here. / To go.',
    glossJa: '場所ではなく「目的」の前置詞 for が決まり文句になります。',
    explainJa: 'Inside the shop のように説明しても通じますが、ネイティブは for here / to go と答えるのが自然です。',
    pitfallJa: 'Eat inside は話し言葉では通じても、定型としては for here。',
    goalTags: ['travel', 'daily'],
    weaknessTags: ['prepositions'],
    scenarioIds: ['cafe-order'],
    showcaseEn: 'For here, please.',
    showcaseJa: '店内でお願いします。',
    drills: [
      {
        id: 'd1',
        cueJa: '「店内でお願いします」と答える',
        fullSentenceEn: 'For here, please.',
        fullSentenceJa: '店内でお願いします。',
        choices: [
          { id: 'ok', text: 'For here, please.', isCorrect: true },
          { id: 'x1', text: 'Inside eating.', tipJa: '短すぎて不自然。定型は For here です。', isCorrect: false },
          { id: 'x2', text: 'Here eat.', tipJa: '語順ではなく固定フレーズを覚えるのが早いです。', isCorrect: false },
        ],
      },
      {
        id: 'd2',
        cueJa: '持ち帰りだと伝える',
        fullSentenceEn: 'To go, please.',
        fullSentenceJa: 'お持ち帰りでお願いします。',
        choices: [
          { id: 'ok', text: 'To go, please.', isCorrect: true },
          { id: 'x1', text: 'Take away.', tipJa: 'USでは to go が一般的です。', isCorrect: false },
          { id: 'x2', text: 'Outside eat.', tipJa: 'Outside は「外で」になり、持ち帰りとずれます。', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'pat-id-like',
    titleJa: "丁寧に頼む: I'd like ... , please.",
    level: 'junior-high-2',
    order: 20,
    formulaEn: "I'd like + (thing) + , please.",
    glossJa: '「〜をください」の型。want よりカフェ・店で無難。',
    explainJa: "日本語の「〜ください」と近いが、want は欲求が強く聞こえることがあります。サービス場面では I'd like が標準的です。",
    pitfallJa: 'Give me ... は短くて便利ですが、場によっては突き放した印象になります。',
    goalTags: ['travel', 'daily'],
    weaknessTags: ['grammar', 'wordOrder'],
    scenarioIds: ['cafe-order'],
    showcaseEn: "I'd like a medium latte, please.",
    showcaseJa: 'ミディアムのラテをお願いします。',
    drills: [
      {
        id: 'd1',
        cueJa: 'ウォーターを注文したい',
        fullSentenceEn: "I'd like a bottle of water, please.",
        fullSentenceJa: '水を一本ください。',
        choices: [
          { id: 'ok', text: "I'd like a bottle of water, please.", isCorrect: true },
          { id: 'x1', text: 'Give me water.', tipJa: '意味は通じますが、カフェでは命令に聞こえることがあります。', isCorrect: false },
          { id: 'x2', text: "I'm liking water.", tipJa: 'like は状態動詞で進行形にしないのが基本です。', isCorrect: false },
        ],
      },
      {
        id: 'd2',
        cueJa: 'サンドイッチが欲しい',
        fullSentenceEn: "I'd like the turkey sandwich, please.",
        fullSentenceJa: 'ターキーサンドをお願いします。',
        choices: [
          { id: 'ok', text: "I'd like the turkey sandwich, please.", isCorrect: true },
          { id: 'x1', text: 'Turkey sandwich want.', tipJa: "語順だけ並べると英文になりません。I'd like で始めましょう。", isCorrect: false },
          { id: 'x2', text: 'Please sandwich turkey.', tipJa: '単語の並べ替えではなく、型に当てはめます。', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'pat-could-i-have',
    titleJa: 'お願い・許可: Could I have ... ?',
    level: 'junior-high-2',
    order: 30,
    formulaEn: 'Could I have + (thing) + ?',
    glossJa: 'Can I よりやわらかく、窓口・サービスで好印象になりやすい。',
    explainJa: 'Could は過去形ですが、ここでは丁寧さのモダリティとして使われます。',
    pitfallJa: 'Could I get はカジュアルでよく使われますが、Could I have の方が無難な場面も。',
    goalTags: ['travel', 'work'],
    weaknessTags: ['grammar', 'wordOrder'],
    scenarioIds: ['airport-checkin'],
    showcaseEn: 'Could I have a window seat?',
    showcaseJa: '窓側の席をお願いできますか？',
    drills: [
      {
        id: 'd1',
        cueJa: '通路側の席がよければと頼む',
        fullSentenceEn: 'Could I have an aisle seat?',
        fullSentenceJa: '通路側の席をお願いできますか？',
        choices: [
          { id: 'ok', text: 'Could I have an aisle seat?', isCorrect: true },
          { id: 'x1', text: 'Give aisle seat.', tipJa: '命令調になります。Could I have で型を作ります。', isCorrect: false },
          { id: 'x2', text: 'I want aisle seat.', tipJa: 'お願いの場では Could I have が無難です。', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'pat-checking-in',
    titleJa: "チェックインを伝える: I'm checking in for ...",
    level: 'junior-high-2',
    order: 40,
    formulaEn: "I'm checking in for + flight / reservation detail.",
    glossJa: '現在進行形で「いま手続きに来ています」と状況を伝える。',
    explainJa: '空港では便名や予約番号とセットで言うとスムーズです。',
    goalTags: ['travel', 'work'],
    weaknessTags: ['wordOrder'],
    scenarioIds: ['airport-checkin'],
    showcaseEn: "I'm checking in for flight BA287.",
    showcaseJa: 'BA287便のチェックインです。',
    drills: [
      {
        id: 'd1',
        cueJa: 'JL405便のチェックインだと伝える',
        fullSentenceEn: "I'm checking in for flight JL405.",
        fullSentenceJa: 'JL405便のチェックインです。',
        choices: [
          { id: 'ok', text: "I'm checking in for flight JL405.", isCorrect: true },
          { id: 'x1', text: 'Check in JL405.', tipJa: "I'm checking in for flight を土台に。", isCorrect: false },
          { id: 'x2', text: 'I check for JL405.', tipJa: '時制・前置詞がズレています。', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'pat-responsible-for',
    titleJa: "担当を説明する: I'm responsible for ...",
    level: 'high-school',
    order: 50,
    formulaEn: "I'm responsible for + noun / -ing",
    glossJa: '担当範囲・役割を一文で言い切るビジネス頻出型。',
    explainJa: '日本語の「〜を担当しています」に直結します。-ing でプロセスを述べると説得力が出ます。',
    pitfallJa: 'responsible of は誤用。前置詞は for。',
    goalTags: ['work', 'exam'],
    weaknessTags: ['prepositions', 'grammar'],
    scenarioIds: ['meeting-intro'],
    showcaseEn: "I'm responsible for aligning our design system with your brand guidelines.",
    showcaseJa: 'デザインシステムを御社のブランドガイドに合わせるのを担当しています。',
    drills: [
      {
        id: 'd1',
        cueJa: 'プロジェクトのスケジュール管理が自分の役割だと説明',
        fullSentenceEn: "I'm responsible for managing the project timeline.",
        fullSentenceJa: 'プロジェクトのスケジュール管理を担当しています。',
        choices: [
          { id: 'ok', text: "I'm responsible for managing the project timeline.", isCorrect: true },
          { id: 'x1', text: "I'm responsible of the timeline.", tipJa: '前置詞は of ではなく for。', isCorrect: false },
          { id: 'x2', text: 'My responsible is timeline.', tipJa: "動く型は I'm responsible for ...。", isCorrect: false },
        ],
      },
    ],
  },
];

export function patternsForGoal(goal: Goal): SentencePattern[] {
  return [...PATTERNS].sort((a, b) => {
    const am = a.goalTags.includes(goal) ? 0 : 1;
    const bm = b.goalTags.includes(goal) ? 0 : 1;
    return am - bm || a.order - b.order;
  });
}
