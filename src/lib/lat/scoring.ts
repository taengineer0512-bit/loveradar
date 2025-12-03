// lib/lat/scoring.ts
import { LatTrait, LAT_TRAIT_BY_INDEX } from "./questions";

export type { LatTrait } from "./questions";

export type LatScores = Record<LatTrait, number>;

export type LatTypeCode =
  | "LBI"
  | "GZI"
  | "MHI"
  | "DDI"
  | "LBI_GZI"
  | "GZI_MHI"
  | "MHI_DDI"
  | "DDI_LBI";

export type LatResult = {
  scores: LatScores;
  mainTrait: LatTrait;
  subTrait: LatTrait;
  typeCode: LatTypeCode;
};

const TRAITS: LatTrait[] = ["LBI", "GZI", "MHI", "DDI"];

// 複合判定のしきい値（平均値の差）
const TYPE_DIFF_THRESHOLD = 0.45;

/**
 * 回答配列（1〜5の16個）から LBI / GZI / MHI / DDI の平均スコアを計算
 */
export function calcLatScores(answers: number[]): LatScores {
  if (answers.length !== LAT_TRAIT_BY_INDEX.length) {
    throw new Error(
      `answers length must be ${LAT_TRAIT_BY_INDEX.length}, got ${answers.length}`
    );
  }

  const sum: Record<LatTrait, number> = {
    LBI: 0,
    GZI: 0,
    MHI: 0,
    DDI: 0,
  };
  const count: Record<LatTrait, number> = {
    LBI: 0,
    GZI: 0,
    MHI: 0,
    DDI: 0,
  };

  answers.forEach((value, idx) => {
    const trait = LAT_TRAIT_BY_INDEX[idx];

    // 1〜5以外はエラーにしておく（フロント側もバリデートする前提）
    if (value < 1 || value > 5) {
      throw new Error(`answer must be between 1 and 5, got ${value}`);
    }

    sum[trait] += value;
    count[trait] += 1;
  });

  const scores: LatScores = {
    LBI: sum.LBI / count.LBI,
    GZI: sum.GZI / count.GZI,
    MHI: sum.MHI / count.MHI,
    DDI: sum.DDI / count.DDI,
  };

  return scores;
}

/**
 * mainTrait / subTrait から 8タイプの typeCode を決定
 * 強い属性＋次点属性の“リング”構造で 4複合タイプに絞る
 */
function decideTypeCode(main: LatTrait, sub: LatTrait): LatTypeCode {
  if (main === sub) {
    return main;
  }

  const key = `${main}-${sub}` as const;

  const comboMap: Record<string, LatTypeCode> = {
    "LBI-GZI": "LBI_GZI",
    "GZI-LBI": "LBI_GZI",

    "GZI-MHI": "GZI_MHI",
    "MHI-GZI": "GZI_MHI",

    "MHI-DDI": "MHI_DDI",
    "DDI-MHI": "MHI_DDI",

    "DDI-LBI": "DDI_LBI",
    "LBI-DDI": "DDI_LBI",
  };

  return comboMap[key] ?? main;
}

/**
 * 属性スコアから mainTrait / subTrait / typeCode を決定
 */
export function decideLatType(scores: LatScores): LatResult {
  // スコアの高い順に並べる
  const sorted = [...TRAITS].sort((a, b) => scores[b] - scores[a]);

  const mainTrait = sorted[0];
  const subTrait = sorted[1];

  const diff = scores[mainTrait] - scores[subTrait];

  let typeCode: LatTypeCode;
  if (diff > TYPE_DIFF_THRESHOLD) {
    // 単独タイプ
    typeCode = mainTrait;
  } else {
    // 複合タイプ
    typeCode = decideTypeCode(mainTrait, subTrait);
  }

  return {
    scores,
    mainTrait,
    subTrait,
    typeCode,
  };
}

/**
 * 1本で全部やりたい場合のユーティリティ
 * answers → scores → type 判定まで返す
 */
export function computeLatResult(answers: number[]): LatResult {
  const scores = calcLatScores(answers);
  return decideLatType(scores);
}
