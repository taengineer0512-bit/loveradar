"use client";

import { MiaImage } from "@/components/mia/MiaImage";

type Props = {
  typeLabel: string;
  shortCopy: string;
};

export function MiaResultHeader({ typeLabel, shortCopy }: Props) {
  return (
    <div className="flex gap-4 md:gap-6 items-center">
      {/* ミアアイコン（丸＋ネオン枠） */}
      <div className="relative shrink-0">
        <MiaImage
          variant="result"
          size={112}
          rounded
          className="border-2 border-pink-400 shadow-[0_0_26px_rgba(236,72,153,0.75)] bg-black"
        />
        {/* 外側の薄いネオンリング */}
        <div className="pointer-events-none absolute inset-0 rounded-full border border-pink-400/40 blur-[1px]" />
      </div>

      {/* 吹き出し */}
      <div className="relative flex-1">
        <div className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-3xl px-4 py-3 md:px-6 md:py-4 shadow-[0_18px_45px_rgba(236,72,153,0.6)]">
          <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.22em] opacity-90">
            MIA&apos;S LAT REPORT
          </p>
          <p className="mt-1 text-sm md:text-base font-bold leading-relaxed">
            「{typeLabel}」ね。
            <br className="hidden md:block" />
            ざっくり言うと、{shortCopy}
          </p>
        </div>

        {/* 吹き出しのしっぽ：ミアの顔の高さに合わせて中央寄せ */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-pink-500 to-fuchsia-500 rotate-45 rounded-sm shadow-lg" />
      </div>
    </div>
  );
}
