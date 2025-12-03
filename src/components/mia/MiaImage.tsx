"use client";

import Image from "next/image";
import clsx from "clsx";

export type MiaVariant =
  | "icon"
  | "result"
  | "full"
  | "face-happy"
  | "face-surprise"
  | "face-angry"
  | "face-fortune"
  | "outfit-fortune";

const MIA_IMAGE_MAP: Record<MiaVariant, { src: string; alt: string }> = {
  icon: { src: "/images/mia/icon.png", alt: "ミア（アイコン）" },
  result: { src: "/images/mia/result.png", alt: "ミア（診断結果用）" },
  full: { src: "/images/mia/full.png", alt: "ミア（全身イラスト）" },
  "face-happy": { src: "/images/mia/face-happy.png", alt: "ミア（喜び表情）" },
  "face-surprise": {
    src: "/images/mia/face-surprise.png",
    alt: "ミア（驚き表情）",
  },
  "face-angry": {
    src: "/images/mia/face-angry.png",
    alt: "ミア（ちょい怒り表情）",
  },
  "face-fortune": {
    src: "/images/mia/face-fortune.png",
    alt: "ミア（占いモード）",
  },
  "outfit-fortune": {
    src: "/images/mia/outfit-fortune.png",
    alt: "ミア（占い師衣装）",
  },
};

// 画像ごとのアスペクト比（full は縦長）
const ASPECT_RATIO: Record<MiaVariant, number> = {
  icon: 1,
  result: 1,
  full: 0.63, // full.png 用（必要ならあとで微調整）
  "face-happy": 1,
  "face-surprise": 1,
  "face-angry": 1,
  "face-fortune": 1,
  "outfit-fortune": 1,
};

type MiaImageProps = {
  variant: MiaVariant;
  size?: number;
  className?: string;
  rounded?: boolean;
};

export function MiaImage({
  variant,
  size = 128,
  className,
  rounded = false,
}: MiaImageProps) {
  const config = MIA_IMAGE_MAP[variant];
  const ratio = ASPECT_RATIO[variant];

  const width = size;
  const height = size / ratio;

  // 正方形のときだけ丸アイコンにする
  const isCircle = rounded && ratio === 1;

  return (
    <div
      className={clsx(
        "relative overflow-hidden",
        isCircle ? "rounded-full" : "rounded-2xl",
        className
      )}
      style={{ width, height }}
    >
      <Image
        src={config.src}
        alt={config.alt}
        fill
        className={clsx(
          "object-cover",
          variant === "full" && "scale-[1.18] translate-y-[-3%]"
        )}
        sizes={`${width}px`}
        priority
      />
    </div>
  );
}
