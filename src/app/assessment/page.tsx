// app/assessment/page.tsx
import AssessmentForm from "./AssessmentForm";

export default function AssessmentPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">恋愛偏差値診断</h1>
      <p className="text-sm text-gray-600 mb-6">
        各項目について、あなたにどのくらい当てはまるかを 1〜5
        の中から選んでください。 （1 = まったく当てはまらない / 5 =
        とても当てはまる）
      </p>
      <AssessmentForm />
    </main>
  );
}
