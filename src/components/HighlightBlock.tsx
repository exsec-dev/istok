import React from "react";
import { PointsType } from "utils";

interface HighlightBlockProps {
  points: PointsType;
  scale?: number;
}

export function HighlightBlock({ points, scale = 1 }: HighlightBlockProps) {
  const strokeWidth = Math.max(1, 2 / scale);
  const pts = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
      width="100%"
      height="100%"
    >
      <polygon
        points={pts}
        fill="#e1eaf930"
        stroke="var(--light-hover-blue-color)"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        opacity={0.9}
      />
    </svg>
  );
}
