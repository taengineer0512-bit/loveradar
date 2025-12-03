// lib/lat/questions.ts

export type LatTrait = "LBI" | "GZI" | "MHI" | "DDI";

export type LatQuestion = {
  id: number; // 1〜16
  text: string; // 質問文（日本語）
  trait: LatTrait; // 紐づく属性
};

export const LAT_QUESTIONS: LatQuestion[] = [
  // LBI：恋バイブス
  {
    id: 1,
    trait: "LBI",
    text: "恋したらさ、気持ち入るの早めじゃない？",
  },
  {
    id: 2,
    trait: "LBI",
    text: "好きになったら行動早くなるタイプよね？",
  },
  {
    id: 3,
    trait: "LBI",
    text: "いい感じになると、他のことちょい疎かになりがちじゃない？",
  },
  {
    id: 4,
    trait: "LBI",
    text: "その場のノリでデート決めることあるよね？",
  },

  // GZI：温度差・情緒ゆらぎ
  {
    id: 5,
    trait: "GZI",
    text: "相手の返信の速さで気持ち左右されちゃう日ある？",
  },
  {
    id: 6,
    trait: "GZI",
    text: "恋愛中さ、テンションの波けっこうデカいって言われたことある？",
  },
  {
    id: 7,
    trait: "GZI",
    text: "距離近い時はめっちゃ近くて、離れると急に離れるタイプ？",
  },
  {
    id: 8,
    trait: "GZI",
    text: "相手の一言を深読みしすぎて、自分でしんどくなることない？",
  },

  // MHI：沼り・依存
  {
    id: 9,
    trait: "MHI",
    text: "気になる人のSNS、つい見ちゃうことあるよね？",
  },
  {
    id: 10,
    trait: "MHI",
    text: "不安なとき連絡ちょい増えがちじゃない？",
  },
  {
    id: 11,
    trait: "MHI",
    text: "一回好きなると、わりと長く引きずる方じゃない？",
  },
  {
    id: 12,
    trait: "MHI",
    text: "恋してるとき、自分のこと後回しにしがちだったりする？",
  },

  // DDI：ドラマ性・起伏
  {
    id: 13,
    trait: "DDI",
    text: "喧嘩すると感情つい強めに出ちゃうほう？",
  },
  {
    id: 14,
    trait: "DDI",
    text: "好き嫌いハッキリしてるってよく言われない？",
  },
  {
    id: 15,
    trait: "DDI",
    text: "恋愛ってさ、なんかドラマチックになりがちじゃない？",
  },
  {
    id: 16,
    trait: "DDI",
    text: "勢いで言っちゃって、あとで後悔するやつ…あるよね？",
  },
];

/**
 * id順で trait だけの配列が欲しいとき用
 * （集計ロジックで answers[ind] → trait を引きたい場合とか）
 */
export const LAT_TRAIT_BY_INDEX: LatTrait[] = LAT_QUESTIONS.sort(
  (a, b) => a.id - b.id
).map((q) => q.trait);
