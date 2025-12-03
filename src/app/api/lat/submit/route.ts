// app/api/lat/submit/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerPublic } from "@/lib/supabase/serverPublic";
import { computeLatResult } from "@/lib/lat/scoring";

export async function POST(req: Request) {
  const supabase = createSupabaseServerPublic();

  try {
    const body = await req.json();

    const answers: number[] = body.answers;
    const meta = body.meta ?? {};

    if (!Array.isArray(answers) || answers.length !== 16) {
      return NextResponse.json(
        { error: "answers must be an array of 16 numbers" },
        { status: 400 }
      );
    }

    if (answers.some((v) => typeof v !== "number" || v < 1 || v > 5)) {
      return NextResponse.json(
        { error: "answers must be numbers between 1 and 5" },
        { status: 400 }
      );
    }

    // スコア＆タイプ計算
    const { scores, mainTrait, subTrait, typeCode } = computeLatResult(answers);

    // Supabase に保存
    const { data, error } = await supabase
      .from("lat_assessments")
      .insert({
        answers,
        lbi_score: scores.LBI,
        gzi_score: scores.GZI,
        mhi_score: scores.MHI,
        ddi_score: scores.DDI,
        type_code: typeCode,
        main_trait: mainTrait,
        sub_trait: subTrait,
        gender: meta.gender ?? null,
        age_range: meta.ageRange ?? null,
        referrer: meta.referrer ?? null,
        line_user_id: meta.lineUserId ?? null,
      })
      .select("share_token, type_code")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error.message || "failed to save assessment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      shareToken: data.share_token,
      typeCode: data.type_code,
      scores,
    });
  } catch (err: any) {
    console.error("LAT submit error:", err);
    return NextResponse.json(
      { error: err?.message ?? "server error" },
      { status: 500 }
    );
  }
}
