// src/lib/loveScore.ts
export type Assessment = Record<string, number | null>;

const clamp1to5 = (v: number) => Math.min(5, Math.max(1, v));
const reverse = (v: number) => 6 - clamp1to5(v); // 1↔5, 2↔4, 3そのまま

// 逆転（高いほど悪い）として扱う項目
const REVERSE_KEYS = new Set<string>([
  // B. 感情・関係パターン（ネガ系）
  "b_q1",
  "b_q2",
  "b_q3",
  "b_q6",
  "b_q8",
  "b_q9",
  // D. 自己開示・信頼（ネガ系）
  "d_q1",
  "d_q2",
  "d_q5",
  "d_q6",
  // E. 回復と成長（ネガ系）
  "e_q4",
  "e_q5",
]);

function normalizeValue(key: string, v: number) {
  const vv = clamp1to5(v);
  return REVERSE_KEYS.has(key) ? reverse(vv) : vv;
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// 1〜5平均 → 0〜100に変換
function avgTo100(a: number) {
  return Math.round(((a - 1) / 4) * 100);
}

export function calcScores(a: Assessment) {
  const pick = (prefix: string, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const key = `${prefix}_q${i + 1}`;
      const raw = a[key];
      if (typeof raw !== "number") return null;
      return normalizeValue(key, raw);
    }).filter((x): x is number => x !== null);

  // 各セクション正規化後の平均
  const A = avg(pick("a", 6)); // 経験系：逆転なし
  const B = avg(pick("b", 10)); // 感情安定・依存耐性
  const C = avg(pick("c", 6)); // 親密/性価値観
  const D = avg(pick("d", 8)); // 自己開示/信頼
  const E = avg(pick("e", 6)); // 回復/成長

  // 0〜100スコア
  const scoreA = avgTo100(A);
  const scoreB = avgTo100(B);
  const scoreC = avgTo100(C);
  const scoreD = avgTo100(D);
  const scoreE = avgTo100(E);

  // 総合（単純平均）
  const overall = Math.round((scoreA + scoreB + scoreC + scoreD + scoreE) / 5);

  // 雑にタイプ名（あとで洗練できる）
  const type = buildType({ scoreA, scoreB, scoreC, scoreD, scoreE, overall });

  return {
    rawAvg: { A, B, C, D, E },
    scores: { scoreA, scoreB, scoreC, scoreD, scoreE, overall },
    type,
  };
}

function buildType({
  scoreA,
  scoreB,
  scoreC,
  scoreD,
  scoreE,
  overall,
}: {
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
  scoreE: number;
  overall: number;
}) {
  const parts: string[] = [];

  parts.push(scoreB >= 65 ? "安定型" : scoreB <= 40 ? "不安定型" : "波あり型");
  parts.push(
    scoreD >= 65 ? "自己開示高め" : scoreD <= 40 ? "自己開示低め" : "慎重型"
  );
  parts.push(
    scoreE >= 65 ? "回復力高め" : scoreE <= 40 ? "引きずり型" : "普通型"
  );
  parts.push(
    scoreA >= 65 ? "経験値高め" : scoreA <= 40 ? "恋愛ビギナー" : "経験普通"
  );
  parts.push(scoreC >= 65 ? "親密派" : scoreC <= 40 ? "距離派" : "バランス派");

  return {
    label: parts.join(" / "),
    overall,
  };
}
