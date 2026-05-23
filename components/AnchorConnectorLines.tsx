'use client';

import { useId } from 'react';

/**
 * Anchor visuals between subtraction circles:
 *   • Diagonal: red bottom→blue top, blue bottom→red top (BWR gradient)
 *   • Top / bottom bubbles: red + blue arrows meet at center (top pair ↔ bottom pair)
 */
export default function AnchorConnectorLines() {
  const uid = useId().replace(/:/g, '');
  const gradRedBlue = `anchor-rb-${uid}`;
  const gradBlueRed = `anchor-br-${uid}`;
  const gradHorizTop = `anchor-top-${uid}`;
  const gradHorizBottom = `anchor-bot-${uid}`;
  const glow = `anchor-glow-${uid}`;
  const arrowRed = `anchor-ar-${uid}`;
  const arrowBlue = `anchor-ab-${uid}`;

  const bubbleStroke = {
    fill: 'none' as const,
    strokeWidth: 3.5,
    strokeLinecap: 'round' as const,
    filter: `url(#${glow})`,
    markerEnd: `url(#${arrowRed})`,
  };

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradRedBlue}
          gradientUnits="userSpaceOnUse"
          x1="34"
          y1="78"
          x2="166"
          y2="22"
        >
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="42%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient
          id={gradBlueRed}
          gradientUnits="userSpaceOnUse"
          x1="166"
          y1="78"
          x2="34"
          y2="22"
        >
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="42%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient
          id={gradHorizTop}
          gradientUnits="userSpaceOnUse"
          x1="52"
          y1="0"
          x2="148"
          y2="0"
        >
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient
          id={gradHorizBottom}
          gradientUnits="userSpaceOnUse"
          x1="52"
          y1="0"
          x2="148"
          y2="0"
        >
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <marker
          id={arrowRed}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M7,4 L0,0 L0,8 Z" fill="#dc2626" />
        </marker>
        <marker
          id={arrowBlue}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M7,4 L0,0 L0,8 Z" fill="#2563eb" />
        </marker>
        <filter id={glow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.25" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Top bubble: red top ↔ blue top */}
      <path
        d="M 52 10 Q 76 6 100 2"
        stroke={`url(#${gradHorizTop})`}
        {...bubbleStroke}
      />
      <path
        d="M 148 10 Q 124 6 100 2"
        stroke={`url(#${gradHorizTop})`}
        {...bubbleStroke}
        markerEnd={`url(#${arrowBlue})`}
      />

      {/* Bottom bubble: red bottom ↔ blue bottom */}
      <path
        d="M 52 90 Q 76 94 100 98"
        stroke={`url(#${gradHorizBottom})`}
        {...bubbleStroke}
      />
      <path
        d="M 148 90 Q 124 94 100 98"
        stroke={`url(#${gradHorizBottom})`}
        {...bubbleStroke}
        markerEnd={`url(#${arrowBlue})`}
      />

      {/* Red bottom → Blue top */}
      <line
        x1="34"
        y1="78"
        x2="166"
        y2="22"
        stroke={`url(#${gradRedBlue})`}
        strokeWidth="5"
        strokeLinecap="round"
        filter={`url(#${glow})`}
      />
      {/* Blue bottom → Red top */}
      <line
        x1="166"
        y1="78"
        x2="34"
        y2="22"
        stroke={`url(#${gradBlueRed})`}
        strokeWidth="5"
        strokeLinecap="round"
        filter={`url(#${glow})`}
      />
    </svg>
  );
}
