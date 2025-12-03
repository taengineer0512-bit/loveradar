// app/assessment/AssessmentForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";

type FormValues = {
  [key: string]: number;
};

// 質問定義（A〜E全部）
const sections: {
  id: string;
  title: string;
  questions: { name: string; label: string }[];
}[] = [
  {
    id: "A",
    title: "恋愛経験ヒストリー",
    questions: [
      { name: "a_q1", label: "これまでに付き合った人数は？" },
      { name: "a_q2", label: "最長の交際期間は？" },
      { name: "a_q3", label: "最短の交際期間は？" },
      { name: "a_q4", label: "告白はどちらからが多かった？" },
      { name: "a_q5", label: "同棲または結婚経験は？（過去含む）" },
      {
        name: "a_q6",
        label: "夜の関係（スキンシップ）は恋愛の重要要素だと思う",
      },
    ],
  },
  {
    id: "B",
    title: "感情・関係パターン",
    questions: [
      { name: "b_q1", label: "相手の機嫌が悪いと、すぐ自分を責めてしまう" },
      { name: "b_q2", label: "嫉妬を感じることが多い" },
      { name: "b_q3", label: "自分の感情を我慢してしまう" },
      { name: "b_q4", label: "好きな人に対して素直に甘えられる" },
      { name: "b_q5", label: "恋人と価値観が合わない時、話し合いで解決できる" },
      { name: "b_q6", label: "別れたあとも相手のSNSを見てしまう" },
      { name: "b_q7", label: "別れたあと、時間をおいて仲直りすることが多い" },
      { name: "b_q8", label: "相手に「依存していた」と感じた経験がある" },
      { name: "b_q9", label: "相手からの連絡が減ると不安になる" },
      { name: "b_q10", label: "恋愛より仕事や趣味を優先できるタイプ" },
    ],
  },
  {
    id: "C",
    title: "親密度・性的価値観",
    questions: [
      { name: "c_q1", label: "スキンシップが多いと安心する" },
      { name: "c_q2", label: "相手の体調や快・不快を意識して行動できる" },
      { name: "c_q3", label: "夜の時間を「愛情表現」として大事にする" },
      { name: "c_q4", label: "一方的に求められるのは苦手" },
      { name: "c_q5", label: "性的な話題をオープンに話せる" },
      { name: "c_q6", label: "恋人との肉体的相性は関係の満足度に影響する" },
    ],
  },
  {
    id: "D",
    title: "自己開示・信頼",
    questions: [
      { name: "d_q1", label: "「嫌だ」と言うのが苦手" },
      {
        name: "d_q2",
        label: "相手に本音を伝える前に、相手の反応を想像してやめる",
      },
      { name: "d_q3", label: "相談を人にするのが得意" },
      { name: "d_q4", label: "パートナーの前で泣ける" },
      { name: "d_q5", label: "相手を信じていても、裏切られる不安はある" },
      {
        name: "d_q6",
        label: "相手に秘密を共有されたとき、プレッシャーを感じる",
      },
      { name: "d_q7", label: "相手の前で“素”を出せる" },
      { name: "d_q8", label: "恋愛で失敗しても自分を責めすぎない" },
    ],
  },
  {
    id: "E",
    title: "回復と成長",
    questions: [
      { name: "e_q1", label: "恋愛で落ち込んだ時の立ち直りは早い方だ" },
      { name: "e_q2", label: "過去の失敗を次に活かせている" },
      { name: "e_q3", label: "感情的になったとき、自分を客観視できる" },
      { name: "e_q4", label: "相手に謝るのが苦手" },
      { name: "e_q5", label: "自分を許すのに時間がかかる" },
      { name: "e_q6", label: "恋愛を通して人として成長したと感じる" },
    ],
  },
];

const scale = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

export default function AssessmentForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "need-login"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<FormValues>();

  const router = useRouter();

  const onSubmit = async (values: FormValues) => {
    setStatus("loading");
    setErrorMessage(null);

    const { error } = await supabase.from("love_assessments").insert({
      ...values,
      user_id: null,
    });

    if (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("success");

    // ★ここでリダイレクト！
    router.push("/assessment/result");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {sections.map((section) => (
        <section key={section.id} className="border rounded-lg p-4">
          <h2 className="font-semibold mb-3">
            {section.id}. {section.title}
          </h2>
          <div className="space-y-4">
            {section.questions.map((q) => (
              <div key={q.name}>
                <p className="text-sm mb-1">{q.label}</p>
                <div className="flex gap-3">
                  {scale.map((s) => (
                    <label
                      key={s.value}
                      className="flex items-center gap-1 text-xs"
                    >
                      <input
                        type="radio"
                        value={s.value}
                        {...register(q.name, {
                          valueAsNumber: true,
                          required: true,
                        })}
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {status === "need-login" && (
        <p className="text-sm text-red-600">
          ※ログイン機能実装後に、診断結果をユーザーごとに保存できるようになります。
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">
          エラーが発生しました：{errorMessage}
        </p>
      )}

      {status === "success" && (
        <p className="text-sm text-green-600">診断結果を保存しました。</p>
      )}

      <button
        type="submit"
        disabled={formState.isSubmitting || status === "loading"}
        className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
      >
        {status === "loading" ? "送信中..." : "診断結果を保存する"}
      </button>
    </form>
  );
}
