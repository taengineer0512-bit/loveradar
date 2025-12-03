"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  gender: string | null;
  birth_year: number | null;
  mbti: string | null;
  love_score: number | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 🔐 ログイン & プロフィール取得
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, gender, birth_year, mbti, love_score")
        .eq("id", userData.user.id)
        .single();

      if (error) {
        console.error(error);
        setErrorMsg("プロフィール情報の取得に失敗しました。");
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // love_score と birth_year は number に変換
    const loveScore =
      profile.love_score !== null && profile.love_score !== undefined
        ? Number(profile.love_score)
        : null;
    const birthYear =
      profile.birth_year !== null && profile.birth_year !== undefined
        ? Number(profile.birth_year)
        : null;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username || null,
        full_name: profile.full_name || null,
        gender: profile.gender || null,
        birth_year: birthYear,
        mbti: profile.mbti || null,
        love_score: loveScore,
      })
      .eq("id", profile.id);

    if (error) {
      console.error(error);
      setErrorMsg("保存に失敗しました。内容を確認してください。");
    } else {
      setSuccessMsg("プロフィールを保存しました。");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 text-sm">プロフィールを読み込み中…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 text-sm">
          プロフィール情報が見つかりませんでした。
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">プロフィール編集</CardTitle>
          <CardDescription>
            Meetus 内で使うニックネームやMBTI、恋愛偏差値などを設定できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* username */}
            <div className="space-y-1">
              <Label htmlFor="username">ニックネーム（必須推奨）</Label>
              <Input
                id="username"
                value={profile.username ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                placeholder="takumi など"
              />
            </div>

            {/* full_name */}
            <div className="space-y-1">
              <Label htmlFor="full_name">お名前（任意）</Label>
              <Input
                id="full_name"
                value={profile.full_name ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="山田 太郎"
              />
            </div>

            {/* gender */}
            <div className="space-y-1">
              <Label htmlFor="gender">性別（任意）</Label>
              <Input
                id="gender"
                value={profile.gender ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                placeholder="male / female など自由入力"
              />
            </div>

            {/* birth_year */}
            <div className="space-y-1">
              <Label htmlFor="birth_year">生まれ年（西暦）</Label>
              <Input
                id="birth_year"
                type="number"
                inputMode="numeric"
                value={profile.birth_year ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    birth_year: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="1993 など"
              />
            </div>

            {/* mbti */}
            <div className="space-y-1">
              <Label htmlFor="mbti">MBTI（任意）</Label>
              <Input
                id="mbti"
                value={profile.mbti ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, mbti: e.target.value.toUpperCase() })
                }
                placeholder="INTJ / ENFP など"
              />
            </div>

            {/* love_score */}
            <div className="space-y-1">
              <Label htmlFor="love_score">恋愛偏差値（0〜100）</Label>
              <Input
                id="love_score"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={profile.love_score ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    love_score: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="まだ未計測なら空欄でOK"
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600 whitespace-pre-line">
                {errorMsg}
              </p>
            )}
            {successMsg && (
              <p className="text-sm text-emerald-600 whitespace-pre-line">
                {successMsg}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "保存中…" : "保存する"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                ダッシュボードに戻る
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
