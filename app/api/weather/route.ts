// ─────────────────────────────────────────────────────────────────────────────
// app/api/weather/route.ts
//
// The Creative Season card — not actual weather.
// Shows your current creative state: Forging, Planting, Exploring, etc.
// Update data/season.json → push → card updates automatically.
// ─────────────────────────────────────────────────────────────────────────────

import { getCurrentSeason } from '@/lib/data';
import { svgResponse, COLORS, FONTS, escapeXml } from '@/lib/svg';

export const runtime = 'edge';

export async function GET(): Promise<Response> {
  const season = getCurrentSeason();
  return svgResponse(buildWeatherSvg(season));
}

type SeasonData = ReturnType<typeof getCurrentSeason>;

function buildWeatherSvg({
  key: _key,
  definition,
  detail,
  updatedAt,
}: SeasonData): string {
  // Format the updatedAt date nicely: "2026-06-27" → "Jun 27, 2026"
  const formattedDate = new Date(updatedAt + 'T00:00:00Z').toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    },
  );

  return `
<svg
  width="495"
  height="140"
  viewBox="0 0 495 140"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Creative Season — ${escapeXml(definition.label)}"
>
  <title>Creative Season — ${escapeXml(definition.label)}</title>

  <!-- Background -->
  <rect width="495" height="140" rx="10"
    fill="${COLORS.bgCard}" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Color accent — top bar in the season's color -->
  <rect x="0" y="0" width="495" height="4" rx="2" fill="${definition.color}" opacity="0.8"/>

  <!-- Season emoji — large, left -->
  <text x="28" y="88" font-size="52" font-family="${FONTS.sans}">${definition.emoji}</text>

  <!-- Section label -->
  <text x="104" y="40" font-family="${FONTS.sans}" font-size="11" font-weight="600"
    letter-spacing="1.5" fill="${COLORS.textMuted}">CREATIVE SEASON</text>

  <!-- Season name -->
  <text x="104" y="72" font-family="${FONTS.sans}" font-size="22" font-weight="700"
    fill="${definition.color}">${escapeXml(definition.label)}</text>

  <!-- Detail text — what's actually happening -->
  <text x="104" y="94" font-family="${FONTS.sans}" font-size="13"
    fill="${COLORS.textSecondary}">${escapeXml(detail)}</text>

  <!-- Divider -->
  <line x1="104" y1="108" x2="471" y2="108" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Description of what this season means -->
  <text x="104" y="126" font-family="${FONTS.sans}" font-size="11"
    fill="${COLORS.textMuted}" font-style="italic"
  >${escapeXml(definition.description)}</text>

  <!-- Updated date — bottom right -->
  <text x="471" y="126" font-family="${FONTS.sans}" font-size="10"
    fill="${COLORS.textMuted}" text-anchor="end">Updated ${formattedDate}</text>

  <!-- Subtle pulse on the emoji to show it's alive -->
  <text x="28" y="88" font-size="52" font-family="${FONTS.sans}" opacity="0">
    ${definition.emoji}
    <animate attributeName="opacity" values="0;0.3;0" dur="3s" repeatCount="indefinite"/>
  </text>

</svg>`.trim();
}
