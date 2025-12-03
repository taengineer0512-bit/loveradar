"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

export type LatScores = {
  LBI: number;
  GZI: number;
  MHI: number;
  DDI: number;
};

type Props = {
  scores: LatScores;
};

export function LatRadarChart({ scores }: Props) {
  const data = [
    { key: "LBI", label: "恋バイブス", value: scores.LBI },
    { key: "GZI", label: "温度差ゆらぎ", value: scores.GZI },
    { key: "MHI", label: "沼り度", value: scores.MHI },
    { key: "DDI", label: "ドラマ性", value: scores.DDI },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="label" />
          <PolarRadiusAxis domain={[1, 5]} tickCount={5} />
          <Radar
            name="LAT"
            dataKey="value"
            fill="rgba(236, 72, 153, 0.6)" // tailwind: pink-500-ish
            stroke="rgb(236, 72, 153)"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
