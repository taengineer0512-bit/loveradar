"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type UserInfo = {
  email: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 ログインチェック
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        // 未ログインならログイン画面へ
        router.replace("/login");
        return;
      }

      setUser({ email: data.user?.email ?? null });

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 text-sm">読み込み中です…</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Meetus ダッシュボード
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700">
            現在ログイン中のメールアドレス：
            <span className="font-mono">{user?.email}</span>
          </p>

          <div className="space-y-2 text-sm text-slate-600">
            <p>ここに今後：</p>
            <ul className="list-disc list-inside">
              <li>イベント一覧 / 申込状況</li>
              <li>プロフィール（MBTI・恋愛偏差値）の編集</li>
              <li>会員向けコンテンツへのリンク</li>
            </ul>
          </div>
          <Link href="/dashboard/profile">
            <Button className="w-full" type="button">
              プロフィールを編集する
            </Button>
          </Link>
          <Link href="/love-check">
            <Button className="w-full md:w-auto">
              恋愛偏差値をチェックする
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={handleLogout}
          >
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
