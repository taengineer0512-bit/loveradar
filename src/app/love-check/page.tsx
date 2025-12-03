"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Question = {
  id: string;
  label: string;
  description?: string;
};

const QUESTIONS: Question[] = [
  {
    id: "communication",
    label: "初対面の人とも会話を続けられる",
    description: "自己紹介〜雑談まで自然に話せるかどうか",
  },
  {
    id: "empathy",
    label: "相手の気持ちを想像して行動できる",
    description: "相手の立場に立って考えられるか",
  },
  {
    id: "self_care",
    label: "身だしなみ・清潔感に気を配っている",
    description: "髪型・服装・体型・においなどのケア",
  },
  {
    id: "stability",
    label: "感情が安定していて、落ち着いて話せる",
    description: "イライラをぶつけない・急に冷たくならないなど",
  },
  {
    id: "action",
    label: "出会いの場に「行動」できている",
    description: "イベント・アプリ・紹介などに参加しているか",
  },
];

export default function LoveCheckPage() {
  const router = useRouter();
  const [values, setValues] = useState<number[]>(
    () => new Array(QUESTIONS.length).fill(5) // デフォルト5点
  );
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ログイン確認 & 現在の love_score を取得
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("love_score")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data && data.love_score != null) {
        setCurrentScore(data.love_score);
      }
    };

    init();
  }, [router]);

  // スライダー変更
  const handleChange = (index: number, newValue: number) => {
    setValues((prev) => {
      const copy = [...prev];
      copy[index] = newValue;
      return copy;
    });
  };

  // スコア計算（0〜100）
  const calcScore = () => {
    const sum = values.reduce((acc, v) => acc + v, 0); // 各項目 0〜10
    const max = QUESTIONS.length * 10;
    return Math.round((sum / max) * 100); // 割合を100点満点に
  };

  // 送信
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const score = calcScore();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ love_score: score })
      .eq("id", user.id);

    if (error) {
      setMessage(
        "保存中にエラーが発生しました。少し時間をおいて再度お試しください。"
      );
      setSaving(false);
      return;
    }

    setCurrentScore(score);
    setMessage(`恋愛偏差値を ${score} に更新しました。`);
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            恋愛偏差値チェック（MVP版）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentScore !== null && (
            <p className="mb-4 text-sm text-slate-600">
              現在の恋愛偏差値：{" "}
              <span className="font-semibold text-emerald-600">
                {currentScore}
              </span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{q.label}</Label>
                  <span className="text-sm text-slate-600">
                    {values[idx]} / 10
                  </span>
                </div>
                {q.description && (
                  <p className="text-xs text-slate-500">{q.description}</p>
                )}
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[values[idx]]}
                  onValueChange={(v) => handleChange(idx, v[0] ?? 0)}
                />
              </div>
            ))}

            {message && (
              <p className="text-sm text-emerald-700 whitespace-pre-line">
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "保存中…" : "この内容で恋愛偏差値を保存"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              ダッシュボードに戻る
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
