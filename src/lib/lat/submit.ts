// lib/lat/submit.ts

export type LatSubmitMeta = {
  gender?: string | null;
  ageRange?: string | null;
  lineUserId?: string | null;
  referrer?: string | null;
};

export type LatSubmitResponse = {
  shareToken: string;
  typeCode: string;
  scores: {
    LBI: number;
    GZI: number;
    MHI: number;
    DDI: number;
  };
};

export async function submitLatAssessment(
  answers: number[],
  meta: LatSubmitMeta = {}
): Promise<LatSubmitResponse> {
  if (answers.length !== 16) {
    throw new Error(`answers must be an array of 16 numbers`);
  }

  const res = await fetch("/api/lat/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answers, meta }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Failed to submit LAT assessment");
  }

  return (await res.json()) as LatSubmitResponse;
}
