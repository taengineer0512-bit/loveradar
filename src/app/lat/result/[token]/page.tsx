import { notFound } from "next/navigation";
import { createSupabaseServerPublic } from "@/lib/supabase/serverPublic";
import { LatRadarChart, type LatScores } from "@/components/lat/LatRadarChart";
import { LAT_TYPE_TEXTS } from "@/lib/lat/typeTexts";
import type { LatTypeCode, LatTrait } from "@/lib/lat/scoring";
import { MiaResultHeader } from "@/components/lat/MiaResultHeader";

type LatAssessmentRow = {
  share_token: string;
  type_code: LatTypeCode;
  lbi_score: number;
  gzi_score: number;
  mhi_score: number;
  ddi_score: number;
  main_trait: LatTrait;
  sub_trait: LatTrait;
  created_at: string;
};

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function LatResultPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = createSupabaseServerPublic();

  const { data, error } = await supabase
    .from("lat_assessments")
    .select(
      "share_token, type_code, lbi_score, gzi_score, mhi_score, ddi_score, main_trait, sub_trait, created_at"
    )
    .eq("share_token", token)
    .maybeSingle<LatAssessmentRow>();

  if (error || !data) {
    console.error("LAT result fetch error:", error);
    notFound();
  }

  const scores: LatScores = {
    LBI: Number(data.lbi_score),
    GZI: Number(data.gzi_score),
    MHI: Number(data.mhi_score),
    DDI: Number(data.ddi_score),
  };

  const typeText = LAT_TYPE_TEXTS[data.type_code];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* ミアヘッダー部分 */}
        <section className="space-y-3">
          <MiaResultHeader
            typeLabel={typeText.label}
            shortCopy={typeText.shortCopy}
          />
          <p className="text-[11px] md:text-xs text-pink-200/80">
            診断コード: {data.share_token.slice(0, 8)} ／ 受診日時:{" "}
            {new Date(data.created_at).toLocaleString("ja-JP")}
          </p>
        </section>

        {/* 結果＋レーダーのカード */}
        <section className="grid md:grid-cols-2 gap-6 items-start">
          {/* 左：テキストカード */}
          <div className="bg-slate-950/75 border border-pink-500/25 rounded-3xl p-5 md:p-6 shadow-[0_0_40px_rgba(15,23,42,0.9)] space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-pink-300">
              {typeText.label}
            </h2>
            <p className="text-sm md:text-[15px] leading-relaxed text-slate-100/95">
              {typeText.description}
            </p>

            <div className="mt-3 text-xs text-neutral-300 space-y-1">
              <p>
                主属性：
                <span className="font-semibold text-pink-300">
                  {data.main_trait}
                </span>
              </p>
              <p>
                次点属性：
                <span className="font-semibold text-pink-300">
                  {data.sub_trait}
                </span>
              </p>
            </div>
          </div>

          {/* 右：レーダーチャートカード */}
          <div className="bg-slate-950/75 border border-pink-500/25 rounded-3xl p-5 md:p-6 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
            <LatRadarChart scores={scores} />
          </div>
        </section>

        {/* フッターコメント */}
        <section className="border-t border-slate-800 pt-6 space-y-3">
          <h3 className="text-sm md:text-base font-semibold text-pink-200">
            ミアから一言
          </h3>
          <p className="text-xs md:text-sm text-slate-100/85 leading-relaxed">
            タイプがどうこうより、「あ〜これ自分あるな」と思ったところを
            ちょっとだけ変えていくのがいちばん効くよ。次の恋バナで、
            この結果ネタにしつつ、行動も1ミリアップデートしてこ。
          </p>
        </section>
      </div>
    </main>
  );
}
