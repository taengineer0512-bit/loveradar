// src/app/admin/assessments/parts.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Assessment = {
  id: string;
  created_at: string;
  ai_comment: string | null;
};

type Props = {
  initialRows: Assessment[];
};

export default function AdminAssessmentList({ initialRows }: Props) {
  const [assessments, setAssessments] = useState<Assessment[]>(initialRows);
  const [adminSecret, setAdminSecret] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // ← 1.2 で追加する state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // AI辛口コメント生成（すでに作った API を呼ぶ想定）
  const handleGenerate = async (id: string) => {
    if (!adminSecret) {
      alert("ADMIN_SECRET を入力してください。");
      return;
    }

    setGeneratingId(id);
    try {
      const res = await fetch("/api/admin/generate-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret, assessmentId: id }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert("生成失敗: " + (json.error ?? res.statusText));
        return;
      }

      const comment = json.comment as string;

      // 画面の一覧を更新
      setAssessments((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, ai_comment: comment } : row
        )
      );
    } catch (e: any) {
      alert("生成中にエラーが発生しました: " + e.message);
    } finally {
      setGeneratingId(null);
    }
  };

  // 1.2: 手動編集したコメントを Supabase に保存
  const handleSaveComment = async (id: string) => {
    if (!editingText.trim()) {
      if (!confirm("コメントが空ですが、このまま保存しますか？")) return;
    }

    const { error } = await supabase
      .from("love_assessments")
      .update({ ai_comment: editingText })
      .eq("id", id);

    if (error) {
      alert("保存に失敗しました: " + error.message);
      return;
    }

    setAssessments((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, ai_comment: editingText } : row
      )
    );

    setEditingId(null);
    setEditingText("");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  return (
    <div className="space-y-4">
      {/* 管理者シークレット入力欄 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          ADMIN_SECRET
        </label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="管理者用シークレットを入力"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
        />
      </div>

      {/* 診断一覧 */}
      <div className="space-y-3">
        {assessments.map((row) => {
          const isEditing = editingId === row.id;

          return (
            <div
              key={row.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between border rounded p-3 gap-3"
            >
              <div className="flex-1 space-y-1">
                <div className="text-xs text-gray-500">
                  {formatDate(row.created_at)}
                </div>

                {/* ステータス表示 */}
                <div className="text-sm">
                  {row.ai_comment ? (
                    <span className="text-green-600 font-medium">
                      AIコメント済み
                    </span>
                  ) : (
                    <span className="text-gray-500">未生成</span>
                  )}
                </div>

                {/* 編集中は textarea、そうでなければコメント表示 */}
                {isEditing ? (
                  <textarea
                    className="w-full mt-1 border rounded px-2 py-1 text-sm min-h-[80px]"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    placeholder="ここにAIコメントを編集／手入力してください"
                  />
                ) : row.ai_comment ? (
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {row.ai_comment}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-row md:flex-col gap-2 md:ml-4">
                {/* AI辛口生成ボタン */}
                <button
                  type="button"
                  onClick={() => handleGenerate(row.id)}
                  disabled={!!generatingId && generatingId === row.id}
                  className="px-3 py-1 rounded bg-black text-white text-xs disabled:opacity-50"
                >
                  {generatingId === row.id ? "生成中..." : "AI辛口生成"}
                </button>

                {/* 編集 / 保存 / キャンセル */}
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSaveComment(row.id)}
                      className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingText("");
                      }}
                      className="px-3 py-1 rounded border text-xs"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(row.id);
                      setEditingText(row.ai_comment ?? "");
                    }}
                    className="px-3 py-1 rounded border text-xs"
                  >
                    編集
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {assessments.length === 0 && (
          <p className="text-sm text-gray-500">診断データがまだありません。</p>
        )}
      </div>
    </div>
  );
}
