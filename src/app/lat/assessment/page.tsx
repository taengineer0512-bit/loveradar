"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LAT_QUESTIONS } from "@/lib/lat/questions";
import { submitLatAssessment } from "@/lib/lat/submit";
import { MiaImage } from "@/components/mia/MiaImage";

const TOTAL_QUESTIONS = LAT_QUESTIONS.length;

export default function LatAssessmentPage() {
  const router = useRouter();

  const [answers, setAnswers] = useState<number[]>(
    Array(TOTAL_QUESTIONS).fill(3)
  );
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

  const question = LAT_QUESTIONS[current];
  const progress = ((current + 1) / TOTAL_QUESTIONS) * 100;

  const handleSelect = (value: number) => {
    const next = [...answers];
    next[current] = value;
    setAnswers(next);
  };

  const handleNext = async () => {
    if (current === TOTAL_QUESTIONS - 1) {
      try {
        setLoading(true);
        const res = await submitLatAssessment(answers, {
          referrer: "lat-web",
        });
        router.push(`/lat/result/${res.shareToken}`);
      } catch (err: any) {
        alert(err.message || "送信に失敗しました");
      } finally {
        setLoading(false);
      }
      return;
    }
    setCurrent((c) => Math.min(TOTAL_QUESTIONS - 1, c + 1));
  };

  const handlePrev = () => {
    setCurrent((c) => Math.max(0, c - 1));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* タイトル */}
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-pink-400/80 font-semibold">
            LAT DIAGNOSIS
          </p>
          <h1 className="text-2xl md:text-3xl font-bold">
            ミアの
            <span className="text-pink-400 mx-1">LAT診断</span>
            で、恋バイブスを数値化するよ
          </h1>
          <p className="text-sm text-neutral-300">
            全部で {TOTAL_QUESTIONS} 問。サクサク答えちゃってOK。
            直感で「1〜5」のどれかを選んでね。
          </p>
        </header>

        {/* 質問カード + ミアカード */}
        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)] gap-6 items-start">
          {/* 左：質問カード */}
          <section className="bg-slate-950/70 border border-pink-500/20 rounded-3xl p-5 md:p-6 shadow-[0_0_30px_rgba(236,72,153,0.25)] space-y-6">
            {/* プログレスバー */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>
                  Question {current + 1} / {TOTAL_QUESTIONS}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 質問文 */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-pink-400/80 font-semibold">
                Q{current + 1}
              </p>
              <p className="text-lg md:text-xl font-semibold leading-relaxed">
                {question.text}
              </p>
              <p className="text-xs text-neutral-400">
                1 = まったくそうでもない / 5 = かなり当てはまる
              </p>
            </div>

            {/* 1〜5ボタン */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>まったく当てはまらない</span>
                <span>とても当てはまる</span>
              </div>

              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((v) => {
                  const isActive = answers[current] === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleSelect(v)}
                      className={[
                        "flex-1 py-2 rounded-full text-sm font-semibold border transition-all",
                        isActive
                          ? "bg-pink-500 text-white border-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.7)] scale-[1.03]"
                          : "bg-slate-900/60 text-neutral-200 border-slate-600 hover:border-pink-400/60 hover:bg-slate-900",
                      ].join(" ")}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ナビゲーション */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={current === 0 || loading}
                className="text-xs md:text-sm text-neutral-300 disabled:text-neutral-600"
              >
                {current === 0 ? "" : "← ひとつ前の質問にもどる"}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-500 text-sm md:text-base font-semibold shadow-[0_10px_30px_rgba(236,72,153,0.6)] hover:bg-pink-400 transition disabled:opacity-60"
              >
                {current === TOTAL_QUESTIONS - 1
                  ? loading
                    ? "診断中…"
                    : "結果を見る"
                  : "次の質問へ →"}
              </button>
            </div>
          </section>

          {/* 右：ミアのサイドカード（スマホでも表示） */}
          <aside className="flex flex-col justify-between bg-slate-950/60 border border-pink-500/25 rounded-3xl p-5 space-y-4">
            {/* 立ちミア＋タイトル */}
            <div className="flex flex-col items-center gap-4">
              <MiaImage
                variant="full"
                size={160}
                className="border border-pink-400/60 shadow-[0_0_28px_rgba(236,72,153,0.55)] rounded-[26px] bg-black/40"
              />

              <div className="text-center space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-pink-400/80 font-semibold">
                  GYARU GUIDE
                </p>
                <p className="text-sm text-neutral-100">
                  ミアが、あなたの恋バイブスを
                  <span className="text-pink-300 font-semibold">
                    {" "}
                    16問で丸裸にしてく{" "}
                  </span>
                  から、正直に答えときな〜。
                </p>
              </div>
            </div>

            {/* 説明ボックス */}
            <div className="bg-slate-900/70 rounded-2xl p-4 space-y-3 border border-slate-700/60">
              <p className="text-xs text-pink-300 font-semibold">
                今は Q{current + 1} / {TOTAL_QUESTIONS} ね
              </p>
              <p className="text-xs text-neutral-200 leading-relaxed">
                「正解」はないから、{" "}
                <span className="text-pink-300 font-semibold">
                  そのときの自分のリアルな癖
                </span>
                で選んでOK。
                <br />
                あとでミアがまとめて、
                <span className="text-pink-300 font-semibold">
                  {" "}
                  タイプ診断とレーダー
                </span>
                にしてあげるから〜。
              </p>
            </div>

            {/* フッター注意書き */}
            <div className="text-[11px] text-neutral-500 space-y-1">
              <p>※ 回答は統計とサービス改善のために匿名で集計されます。</p>
              <p>※ 気が向いたらお友だちにもやらせてみてね。</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
