// src/app/api/admin/generate-comment/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // 今はRLS OFFなのでanonでOK
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assessmentId, adminSecret } = body;

    // 管理者用シークレットチェック
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId required" },
        { status: 400 }
      );
    }

    // 対象の診断レコード取得
    const { data: a, error: fetchErr } = await supabase
      .from("love_assessments")
      .select("*")
      .eq("id", assessmentId)
      .maybeSingle();

    if (fetchErr || !a) {
      return NextResponse.json(
        { error: fetchErr?.message ?? "not found" },
        { status: 404 }
      );
    }

    // ----- プロンプト組み立て（辛口コメント用） -----
    const prompt = `
あなたは恋愛コーチAIです。口調は辛口だけど、相手をちゃんと良くしたい前提でコメントします。

以下の恋愛診断の回答から、その人の恋愛傾向と課題を読み取り、
「グサッとくるけど前向きになれる」辛口コメントを 100〜180文字の日本語で1つだけ出してください。

【スコア（1〜5）】
A. 恋愛経験ヒストリー:
${a.a_q1}, ${a.a_q2}, ${a.a_q3}, ${a.a_q4}, ${a.a_q5}, ${a.a_q6}

B. 感情・関係パターン:
${a.b_q1}, ${a.b_q2}, ${a.b_q3}, ${a.b_q4}, ${a.b_q5}, ${a.b_q6}, ${a.b_q7}, ${a.b_q8}, ${a.b_q9}, ${a.b_q10}

C. 親密度・性的価値観:
${a.c_q1}, ${a.c_q2}, ${a.c_q3}, ${a.c_q4}, ${a.c_q5}, ${a.c_q6}

D. 自己開示・信頼:
${a.d_q1}, ${a.d_q2}, ${a.d_q3}, ${a.d_q4}, ${a.d_q5}, ${a.d_q6}, ${a.d_q7}, ${a.d_q8}

E. 回復と成長:
${a.e_q1}, ${a.e_q2}, ${a.e_q3}, ${a.e_q4}, ${a.e_q5}, ${a.e_q6}

【トーンとルール】
- 「優しく励ます」より「図星を突いて反省させる」寄り
- ただし人格否定はしない（行動とパターンにだけ言及）
- 絵文字・顔文字は使わない
- 箇条書きにせず、1つのまとまった文章として書く
`;

    // ----- OpenAI Chat Completions を直接叩く -----
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // コスパ良いモデル。なければ gpt-4o などに変えてOK
        messages: [
          {
            role: "system",
            content:
              "You are a strict but caring Japanese dating coach. Reply only in Japanese.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("OpenAI error:", text);
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const json = await res.json();
    const aiComment: string | undefined =
      json.choices?.[0]?.message?.content?.trim();

    if (!aiComment) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    // ----- Supabase にコメント保存 -----
    const { error: updateErr } = await supabase
      .from("love_assessments")
      .update({
        ai_comment: aiComment,
        ai_generated_at: new Date().toISOString(),
      })
      .eq("id", assessmentId);

    if (updateErr) {
      console.error(updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ aiComment });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message ?? "server error" },
      { status: 500 }
    );
  }
}
