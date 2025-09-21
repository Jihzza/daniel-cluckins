import React, { useId, useMemo } from "react";

/**
 * Regular-octagon avatar with:
 * - a perfectly even ring (no stroke artifacts)
 * - a transparent gap between ring and image
 * - the photo clipped to an inner octagon
 */
export default function OctagonAvatar({
  src,
  alt = "",
  size = 112,        // px
  ringWidth = 6,     // px (thickness of the colored ring)
  gap = 8,           // px (transparent space between ring and image)
  ringColor = "#24C8FF",
  className = "",
}) {
  const clipId = useId();

  // Regular octagon points in a 0..100 viewBox
  // 29.289% == (1 - 1/√2) * 100 — standard for a regular octagon in a square
  const OUTER = useMemo(
    () => [
      [29.289, 0], [70.711, 0],
      [100, 29.289], [100, 70.711],
      [70.711, 100], [29.289, 100],
      [0, 70.711], [0, 29.289],
    ],
    []
  );

  // px → viewBox units so visuals are stable at any `size`
  const unitsPerPx = 100 / size;
  const ringU = ringWidth * unitsPerPx; // band thickness
  const gapU  = gap * unitsPerPx;       // transparent gap thickness

  // For a regular polygon, moving sides inward by distance d is equivalent
  // to scaling about the center by (r - d) / r with r = 50 (inradius here).
  const scaleForInset = (d) => Math.max(0, (50 - d) / 50);

  const midScale   = scaleForInset(ringU);            // inner edge of the ring
  const imageScale = scaleForInset(ringU + gapU);     // image boundary

  const scalePoints = (pts, s) =>
    pts.map(([x, y]) => [50 + (x - 50) * s, 50 + (y - 50) * s]);

  const MID   = useMemo(() => scalePoints(OUTER, midScale),   [OUTER, midScale]);
  const INNER = useMemo(() => scalePoints(OUTER, imageScale), [OUTER, imageScale]);

  const toPoints = (pts) => pts.map(([x, y]) => `${x},${y}`).join(" ");
  const toPath   = (pts) => `M ${pts.map(([x, y]) => `${x} ${y}`).join(" L ")} Z`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden={!alt}
      shapeRendering="geometricPrecision"
    >
      <defs>
        {/* Clip the photo to the INNER octagon */}
        <clipPath id={clipId}>
          <polygon points={toPoints(INNER)} />
        </clipPath>
      </defs>

      {/* Draw the ring as a filled band: OUTER minus MID, no stroke needed */}
      <path
        d={`${toPath(OUTER)} ${toPath(MID)}`}
        fill={ringColor}
        fillRule="evenodd"   /* creates the hollow ring */
      />

      {/* Image clipped to INNER, leaving a transparent gap */}
      <image
        href={src}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      {alt ? <title>{alt}</title> : null}
    </svg>
  );
}
