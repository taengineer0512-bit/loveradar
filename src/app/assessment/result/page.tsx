// src/app/assessment/result/page.tsx
import { createSupabaseServerPublic } from "@/lib/supabase/serverPublic";
import { calcScores } from "@/lib/loveScore";
import RadarChartView from "./radar";

export default async function ResultPage() {
  const supabase = createSupabaseServerPublic();

  const { data, error } = await supabase
    .from("love_assessments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">診断結果</h1>
        <p className="mt-4 text-red-600">読み込みエラー: {error.message}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">診断結果</h1>
        <p className="mt-4">まだ診断データがありません。</p>
      </main>
    );
  }

  const { scores, type } = calcScores(data);

  const radarData = [
    { axis: "経験(A)", value: scores.scoreA },
    { axis: "感情(B)", value: scores.scoreB },
    { axis: "親密(C)", value: scores.scoreC },
    { axis: "信頼(D)", value: scores.scoreD },
    { axis: "成長(E)", value: scores.scoreE },
  ];

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">恋愛偏差値診断：結果</h1>
        <p className="text-sm text-gray-600 mt-1">
          最新の診断結果を表示しています
        </p>
      </header>

      <section className="border rounded-xl p-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">総合 恋愛偏差値</p>
          <p className="text-5xl font-bold mt-2">{scores.overall}</p>
          <p className="text-sm mt-2 text-gray-600">{type.label}</p>
        </div>
      </section>

      <section className="border rounded-xl p-4">
        <h2 className="font-semibold mb-3">5軸レーダー</h2>
        <RadarChartView data={radarData} />
      </section>

      <section className="border rounded-xl p-4 space-y-2">
        <h2 className="font-semibold">セクション別スコア</h2>
        <ul className="text-sm grid grid-cols-2 gap-2">
          <li>A. 恋愛経験ヒストリー：{scores.scoreA}</li>
          <li>B. 感情・関係パターン：{scores.scoreB}</li>
          <li>C. 親密度・性的価値観：{scores.scoreC}</li>
          <li>D. 自己開示・信頼：{scores.scoreD}</li>
          <li>E. 回復と成長：{scores.scoreE}</li>
        </ul>
      </section>

      {/* ▼ AI辛口コメントセクション */}
      <section className="border rounded-xl p-4">
        <h2 className="font-semibold mb-2">
          {data.ai_comment ? "AI辛口コメント" : "仮の辛口コメント（後でAI化）"}
        </h2>

        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {data.ai_comment ? (
            data.ai_comment
          ) : (
            <>
              {scores.overall >= 70 &&
                "恋愛力はかなり高め。相手の心理も読めるタイプ。ただ“余裕ぶって放置”しがちなので、好意の言語化はサボるな。"}
              {scores.overall < 70 &&
                scores.overall >= 50 &&
                "平均より上。悪くないけど“無意識の甘さ”が残ってる。特に感情(B)と信頼(D)が弱いと、良い相手を逃すぞ。"}
              {scores.overall < 50 &&
                "正直、恋愛の設計が雑。感情(B)の揺れや自己開示(D)の弱さが足を引っ張ってる可能性大。まずは“相手の反応待ち”をやめて行動で改善しよう。"}
            </>
          )}
        </p>

        {data.ai_generated_at && (
          <p className="text-xs text-gray-500 mt-2">
            AI生成日時：
            {new Date(data.ai_generated_at).toLocaleString("ja-JP", {
              timeZone: "Asia/Tokyo",
            })}
          </p>
        )}
      </section>
    </main>
  );
}
