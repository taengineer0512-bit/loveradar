// src/app/admin/assessments/page.tsx
import { createSupabaseServerPublic } from "@/lib/supabase/serverPublic";
import AdminAssessmentList from "./parts";

type Assessment = {
  id: string;
  created_at: string;
  ai_comment: string | null;
};

export default async function AdminAssessmentsPage() {
  const supabase = createSupabaseServerPublic();

  const { data } = await supabase
    .from("love_assessments")
    .select("id, created_at, ai_comment")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">管理：診断一覧</h1>
      <p className="text-sm text-gray-600">
        ここでAI辛口コメントを手動生成してDBに保存します。
      </p>

      <AdminAssessmentList initialRows={data ?? []} />
    </main>
  );
}
