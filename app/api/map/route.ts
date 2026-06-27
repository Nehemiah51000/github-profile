// ─────────────────────────────────────────────────────────────────────────────
// app/api/map/route.ts
//
// THE MAP — the kingdom visualized.
//
// This is the most ambitious endpoint. It renders an isometric-style map
// of the Kingdom of Technology. As Nesh's streak and contributions grow,
// new structures appear on the map — the kingdom literally expands.
//
// Map evolution:
//   0–6 days    → campfire only
//   7–29 days   → campfire + tent
//   30–99 days  → small forge building appears
//   100–364     → the library rises
//   365–729     → walls and gates are built
//   730–1499    → towers appear
//   1500+       → the full castle — Kingdom of Technology
//
// The map also shows the current creative season as weather/sky color.
// ─────────────────────────────────────────────────────────────────────────────

import { getGitHubStats, getFlameLevel } from '@/lib/github';
import { getCurrentSeason } from '@/lib/data';
import { svgResponse, COLORS, FONTS, escapeXml } from '@/lib/svg';

export const runtime = 'edge';

export async function GET(): Promise<Response> {
  const [stats, season] = await Promise.all([
    getGitHubStats(),
    Promise.resolve(getCurrentSeason()),
  ]);

  const level = getFlameLevel(stats.streak);
  const svg = buildMapSvg(
    stats.streak,
    level,
    season.definition.color,
    season.definition.emoji,
  );
  return svgResponse(svg);
}

// ─── Map tier thresholds ──────────────────────────────────────────────────────

function getMapTier(streak: number): number {
  if (streak >= 1500) return 6; // Full castle
  if (streak >= 730) return 5; // Towers
  if (streak >= 365) return 4; // Walls & gates
  if (streak >= 100) return 3; // Library
  if (streak >= 30) return 2; // Forge building
  if (streak >= 7) return 1; // Tent
  return 0; // Just the campfire
}

// ─── Main SVG builder ─────────────────────────────────────────────────────────

function buildMapSvg(
  streak: number,
  _level: ReturnType<typeof getFlameLevel>,
  seasonColor: string,
  seasonEmoji: string,
): string {
  const tier = getMapTier(streak);

  // Sky color shifts with season
  const skyTop = `${seasonColor}33`;
  const skyBottom = `${COLORS.bgCard}`;

  return `
<svg
  width="495"
  height="280"
  viewBox="0 0 495 280"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Kingdom of Technology — Day ${streak}"
>
  <title>Kingdom of Technology — Day ${streak}</title>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${skyTop}"/>
      <stop offset="100%" stop-color="${skyBottom}"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#1a2332"/>
      <stop offset="100%" stop-color="#0d1117"/>
    </linearGradient>
  </defs>

  <!-- Card border -->
  <rect width="495" height="280" rx="10" fill="${COLORS.bgCard}" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Sky -->
  <rect x="1" y="1" width="493" height="200" rx="9" fill="url(#sky)"/>

  <!-- Stars — always present, more visible on higher tiers -->
  ${buildStars(tier)}

  <!-- Season emoji in sky corner -->
  <text x="460" y="32" font-size="20" font-family="${FONTS.sans}" opacity="0.7">${seasonEmoji}</text>

  <!-- Ground plane -->
  <ellipse cx="248" cy="195" rx="220" ry="30" fill="url(#ground)" opacity="0.8"/>

  <!-- ── Map structures — tier-gated ── -->

  <!-- Tier 0+: The campfire — always present -->
  ${campfire(248, 172)}

  <!-- Tier 1+: The tent -->
  ${tier >= 1 ? tent(170, 165) : lockedSilhouette(170, 165, '🏕', '7 days')}

  <!-- Tier 2+: The forge -->
  ${tier >= 2 ? forge(320, 155) : lockedSilhouette(320, 158, '⚒', '30 days')}

  <!-- Tier 3+: The library -->
  ${tier >= 3 ? library(150, 148) : lockedSilhouette(148, 152, '📚', '100 days')}

  <!-- Tier 4+: Walls -->
  ${tier >= 4 ? walls() : ''}

  <!-- Tier 5+: The tower -->
  ${tier >= 5 ? tower(340, 120) : tier >= 3 ? lockedSilhouette(340, 130, '🗼', '730 days') : ''}

  <!-- Tier 6: The castle -->
  ${tier >= 6 ? castle(210, 80) : tier >= 4 ? lockedSilhouette(210, 100, '🏰', '1500 days') : ''}

  <!-- Ground path between structures -->
  <ellipse cx="248" cy="195" rx="180" ry="18" fill="${COLORS.bgCard}" opacity="0.3"/>

  <!-- Bottom info bar -->
  <rect x="0" y="248" width="495" height="32" rx="0" fill="${COLORS.bgCard}" opacity="0.95"/>
  <rect x="0" y="276" width="495" height="4" rx="0"
    fill="${seasonColor}" opacity="0.7"/>

  <!-- Title in info bar -->
  <text x="24" y="269" font-family="${FONTS.sans}" font-size="12" font-weight="700"
    fill="${COLORS.textPrimary}">🏰 Kingdom of Technology</text>

  <!-- Day counter -->
  <text x="471" y="269" font-family="${FONTS.sans}" font-size="12" font-weight="600"
    fill="${COLORS.amber}" text-anchor="end">Day ${streak}</text>

  <!-- Tier label -->
  <text x="248" y="269" font-family="${FONTS.sans}" font-size="11"
    fill="${COLORS.textSecondary}" text-anchor="middle"
  >${escapeXml(TIER_LABELS[tier] ?? '')}</text>

</svg>`.trim();
}

// ─── Structure builders ───────────────────────────────────────────────────────
// Each returns an SVG string. Positions are absolute within the 495×280 canvas.

function campfire(cx: number, cy: number): string {
  return `
  <!-- Campfire -->
  <g transform="translate(${cx}, ${cy})">
    <!-- Logs -->
    <line x1="-10" y1="8" x2="10" y2="0" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>
    <line x1="10" y1="8" x2="-10" y2="0" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>
    <!-- Flame -->
    <path d="M0 0 C-5 -8 -3 -16 0 -20 C3 -16 5 -8 0 0Z"
      fill="${COLORS.amber}" opacity="0.9">
      <animate attributeName="d"
        values="M0 0 C-5 -8 -3 -16 0 -20 C3 -16 5 -8 0 0Z;
                M0 0 C-6 -10 -2 -18 0 -22 C2 -18 6 -10 0 0Z;
                M0 0 C-4 -7 -4 -15 0 -19 C4 -15 4 -7 0 0Z;
                M0 0 C-5 -8 -3 -16 0 -20 C3 -16 5 -8 0 0Z"
        dur="1.5s" repeatCount="indefinite"/>
    </path>
    <!-- Glow -->
    <ellipse cx="0" cy="2" rx="12" ry="4" fill="${COLORS.amber}" opacity="0.2">
      <animate attributeName="opacity" values="0.2;0.4;0.2" dur="1.5s" repeatCount="indefinite"/>
    </ellipse>
  </g>`;
}

function tent(x: number, y: number): string {
  return `
  <!-- Tent -->
  <g transform="translate(${x}, ${y})">
    <polygon points="0,30 25,-5 50,30" fill="#1e3a5f" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>
    <polygon points="15,30 25,10 35,30" fill="#0d2847"/>
    <line x1="25" y1="-5" x2="25" y2="-15" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="25" cy="-17" r="2" fill="${COLORS.teal}" opacity="0.8"/>
  </g>`;
}

function forge(x: number, y: number): string {
  return `
  <!-- Forge building -->
  <g transform="translate(${x}, ${y})">
    <!-- Main structure -->
    <rect x="0" y="10" width="50" height="40" rx="2" fill="#1a2535" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>
    <!-- Roof -->
    <polygon points="-4,10 25,-8 54,10" fill="#0f172a" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>
    <!-- Door -->
    <rect x="18" y="30" width="14" height="20" rx="2" fill="#0d1117"/>
    <!-- Chimney -->
    <rect x="34" y="-4" width="8" height="16" rx="1" fill="#1e293b"/>
    <!-- Smoke from chimney -->
    <circle cx="38" cy="-8" r="3" fill="${COLORS.textMuted}" opacity="0">
      <animate attributeName="cy"      values="-8;-28;-48" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.4;0"    dur="3s" repeatCount="indefinite"/>
      <animate attributeName="r"       values="3;6;9"      dur="3s" repeatCount="indefinite"/>
    </circle>
    <!-- Amber window glow -->
    <rect x="6" y="20" width="10" height="8" rx="1" fill="${COLORS.amber}" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.9;0.5;0.8;0.6" dur="2s" repeatCount="indefinite"/>
    </rect>
  </g>`;
}

function library(x: number, y: number): string {
  return `
  <!-- Library -->
  <g transform="translate(${x}, ${y})">
    <rect x="0" y="15" width="56" height="48" rx="2" fill="#1a2535" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>
    <!-- Classical columns -->
    <rect x="8"  y="10" width="6" height="53" rx="1" fill="#1e293b"/>
    <rect x="22" y="10" width="6" height="53" rx="1" fill="#1e293b"/>
    <rect x="36" y="10" width="6" height="53" rx="1" fill="#1e293b"/>
    <!-- Pediment / roof -->
    <polygon points="-2,10 28,-10 58,10" fill="#0f172a" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>
    <!-- Door -->
    <rect x="20" y="40" width="16" height="23" rx="1" fill="#0d1117"/>
    <!-- Purple window — philosophy lives here -->
    <rect x="8" y="20" width="8" height="10" rx="1" fill="${COLORS.purple}" opacity="0.5"/>
    <rect x="40" y="20" width="8" height="10" rx="1" fill="${COLORS.purple}" opacity="0.5"/>
  </g>`;
}

function walls(): string {
  return `
  <!-- Kingdom walls — horizontal lines across the ground -->
  <path d="M60,210 L60,190 L90,185 L90,205Z"  fill="#1e293b" stroke="${COLORS.bgCardBorder}" stroke-width="0.8"/>
  <path d="M405,210 L405,190 L435,185 L435,205Z" fill="#1e293b" stroke="${COLORS.bgCardBorder}" stroke-width="0.8"/>
  <path d="M60,195 L435,188" stroke="#1e293b" stroke-width="8" stroke-linecap="square" opacity="0.8"/>
  <!-- Battlements -->
  ${[80, 120, 160, 200, 240, 280, 320, 360, 400]
    .map(
      (x) =>
        `<rect x="${x}" y="183" width="10" height="8" rx="1" fill="#263548"/>`,
    )
    .join('')}`;
}

function tower(x: number, y: number): string {
  return `
  <!-- Tower -->
  <g transform="translate(${x}, ${y})">
    <rect x="0" y="20" width="36" height="80" rx="2" fill="#1a2535" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>
    <!-- Battlements on top -->
    <rect x="-2" y="14" width="40" height="10" rx="1" fill="#1e293b"/>
    ${[0, 10, 20, 28].map((ox) => `<rect x="${ox}" y="8" width="8" height="10" rx="1" fill="#263548"/>`).join('')}
    <!-- Arrow-slit windows -->
    <rect x="14" y="35" width="8" height="14" rx="1" fill="#0d1117"/>
    <rect x="14" y="60" width="8" height="14" rx="1" fill="#0d1117"/>
    <!-- Flag -->
    <line x1="18" y1="8" x2="18" y2="-12" stroke="#475569" stroke-width="1.5"/>
    <polygon points="18,-12 34,-6 18,-1" fill="${COLORS.amber}" opacity="0.9"/>
    <!-- Blue window glow -->
    <rect x="14" y="35" width="8" height="14" rx="1" fill="${COLORS.blue}" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite"/>
    </rect>
  </g>`;
}

function castle(x: number, y: number): string {
  return `
  <!-- The Castle — Kingdom of Technology -->
  <g transform="translate(${x}, ${y})">
    <!-- Main keep -->
    <rect x="20" y="40" width="70" height="110" rx="2" fill="#1a2535" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>
    <!-- Left tower -->
    <rect x="0" y="55" width="28" height="95" rx="2" fill="#1e2d3d" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>
    <!-- Right tower -->
    <rect x="82" y="55" width="28" height="95" rx="2" fill="#1e2d3d" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>
    <!-- Battlements — left tower -->
    ${[-2, 6, 14, 22].map((ox) => `<rect x="${ox}" y="48" width="7" height="10" rx="1" fill="#263548"/>`).join('')}
    <!-- Battlements — right tower -->
    ${[82, 90, 98, 106].map((ox) => `<rect x="${ox}" y="48" width="7" height="10" rx="1" fill="#263548"/>`).join('')}
    <!-- Battlements — keep -->
    ${[20, 30, 40, 55, 65, 75].map((ox) => `<rect x="${ox}" y="33" width="9" height="10" rx="1" fill="#263548"/>`).join('')}
    <!-- Gate arch -->
    <path d="M42,150 L42,120 Q55,108 68,120 L68,150Z" fill="#0d1117"/>
    <!-- Portcullis lines -->
    ${[44, 50, 56, 62].map((gx) => `<line x1="${gx}" y1="120" x2="${gx}" y2="150" stroke="#1e293b" stroke-width="1.5"/>`).join('')}
    <!-- Windows with glow -->
    <rect x="26" y="75"  width="12" height="16" rx="2" fill="${COLORS.amber}"  opacity="0.5"/>
    <rect x="72" y="75"  width="12" height="16" rx="2" fill="${COLORS.blue}"   opacity="0.5"/>
    <rect x="46" y="65"  width="18" height="20" rx="2" fill="${COLORS.purple}" opacity="0.5"/>
    <rect x="46" y="95"  width="18" height="16" rx="2" fill="${COLORS.teal}"   opacity="0.4"/>
    <!-- Flags -->
    <line x1="14" y1="48" x2="14" y2="20" stroke="#475569" stroke-width="1.5"/>
    <polygon points="14,20 28,26 14,32" fill="${COLORS.amber}" opacity="0.9"/>
    <line x1="96" y1="48" x2="96" y2="20" stroke="#475569" stroke-width="1.5"/>
    <polygon points="96,20 110,26 96,32" fill="${COLORS.amber}" opacity="0.9"/>
    <!-- Animated window pulses -->
    <rect x="46" y="65" width="18" height="20" rx="2" fill="${COLORS.purple}" opacity="0">
      <animate attributeName="opacity" values="0;0.4;0" dur="4s" repeatCount="indefinite"/>
    </rect>
  </g>`;
}

/** Ghost silhouette shown for structures not yet unlocked */
function lockedSilhouette(
  x: number,
  y: number,
  emoji: string,
  requirement: string,
): string {
  return `
  <!-- Locked structure: ${requirement} -->
  <g transform="translate(${x}, ${y})" opacity="0.25">
    <text font-size="24" font-family="${FONTS.sans}" y="0">${emoji}</text>
    <text x="12" y="18" font-family="${FONTS.sans}" font-size="9"
      fill="${COLORS.textMuted}" text-anchor="middle">${escapeXml(requirement)}</text>
  </g>`;
}

function buildStars(tier: number): string {
  const stars = [
    { cx: 40, cy: 30 },
    { cx: 80, cy: 18 },
    { cx: 130, cy: 40 },
    { cx: 200, cy: 15 },
    { cx: 260, cy: 35 },
    { cx: 310, cy: 20 },
    { cx: 370, cy: 40 },
    { cx: 420, cy: 18 },
    { cx: 460, cy: 32 },
    { cx: 60, cy: 60 },
    { cx: 160, cy: 55 },
    { cx: 340, cy: 58 },
    { cx: 450, cy: 55 },
    { cx: 110, cy: 80 },
    { cx: 390, cy: 75 },
  ];

  const visible = Math.min(stars.length, 3 + tier * 2);

  return stars
    .slice(0, visible)
    .map(({ cx, cy }, i) => {
      const dur = `${2.5 + (i % 4) * 0.5}s`;
      const delay = `${(i * 0.3) % 2}s`;
      return `
  <circle cx="${cx}" cy="${cy}" r="1.2" fill="${COLORS.textMuted}" opacity="0.4">
    <animate attributeName="opacity" values="0.4;0.9;0.4" dur="${dur}" begin="${delay}" repeatCount="indefinite"/>
  </circle>`;
    })
    .join('');
}

// ─── Tier labels ──────────────────────────────────────────────────────────────

const TIER_LABELS: Record<number, string> = {
  0: 'A campfire in the wilderness',
  1: 'The first camp is set',
  2: 'The forge is lit',
  3: 'Knowledge takes shape',
  4: 'The walls are rising',
  5: 'Towers guard the kingdom',
  6: 'The Kingdom of Technology stands',
};
