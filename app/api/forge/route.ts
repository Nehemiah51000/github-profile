// ─────────────────────────────────────────────────────────────────────────────
// app/api/forge/route.ts
//
// THE FORGE — the heart of the kingdom.
//
// Returns an animated SVG flame that evolves as your GitHub streak grows.
// The longer the streak, the more powerful the flame becomes.
//
// Flame levels (defined in lib/github.ts):
//   ember   →  0–6 days    — just getting started
//   low     →  7–29 days   — consistency building
//   orange  →  30–99 days  — discipline forming
//   blue    →  100–364     — mastery emerging
//   purple  →  365–729     — a year of showing up
//   white   →  730–1499    — rare discipline
//   scarlet →  1500+       — a force of nature
// ─────────────────────────────────────────────────────────────────────────────

import { getGitHubStats, getFlameLevel, type FlameLevel } from '@/lib/github';
import { svgResponse, COLORS, FONTS, escapeXml } from '@/lib/svg';

export const runtime = 'edge'; // Runs at the edge — fastest possible response

export async function GET(): Promise<Response> {
  const stats = await getGitHubStats();
  const level = getFlameLevel(stats.streak);
  const svg = buildForgeSvg(stats.streak, stats.totalContributions, level);
  return svgResponse(svg);
}

// ─── SVG builder ─────────────────────────────────────────────────────────────

function buildForgeSvg(
  streak: number,
  totalContributions: number,
  level: FlameLevel,
): string {
  const config = FLAME_CONFIG[level];

  return `
<svg
  width="495"
  height="230"
  viewBox="0 0 495 230"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="The Forge — ${streak} day streak"
>
  <title>The Forge — ${streak} day streak</title>
  <defs>
    ${buildGradients(config)}
    ${buildFilters(config)}
    ${buildAnimations(level)}
  </defs>

  <!-- Card background -->
  <rect width="495" height="230" rx="10" fill="${COLORS.bgCard}" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Ambient glow behind the flame -->
  <ellipse cx="140" cy="175" rx="70" ry="20" fill="${config.color}18" filter="url(#ambientGlow)"/>

  <!-- THE FLAME — three layered paths for depth -->
  ${buildFlame(config)}

  <!-- Ember particles floating upward -->
  ${buildEmbers(config, level)}

  <!-- Right panel — stats and label -->
  ${buildStatsPanel(streak, totalContributions, level, config)}

  <!-- Bottom border accent -->
  <rect x="0" y="226" width="495" height="4" rx="2" fill="url(#bottomAccent)"/>

</svg>`.trim();
}

// ─── Flame shape builder ──────────────────────────────────────────────────────

function buildFlame(config: FlameConfig): string {
  // Three concentric flame paths — outer, mid, inner core
  // Each is a bezier curve path approximating a teardrop/flame shape
  // The paths are intentionally hand-tuned to look natural

  return `
  <!-- Outer flame -->
  <path
    d="M140 180
       C100 180 72 155 72 125
       C72 95 90 80 105 65
       C110 58 108 45 112 35
       C120 55 115 68 120 78
       C128 60 130 40 140 20
       C150 40 152 60 160 78
       C165 68 160 55 168 35
       C172 45 170 58 175 65
       C190 80 208 95 208 125
       C208 155 180 180 140 180Z"
    fill="url(#outerFlame)"
    filter="url(#flameBlur)"
    opacity="0.9"
  >
    <animateTransform
      attributeName="transform"
      type="scale"
      values="1,1; 1.03,0.98; 0.98,1.02; 1.02,0.99; 1,1"
      dur="3s"
      repeatCount="indefinite"
      additive="sum"
      origin="140 180"
    />
  </path>

  <!-- Mid flame -->
  <path
    d="M140 172
       C112 172 92 152 92 128
       C92 108 105 95 115 82
       C120 75 118 62 122 52
       C128 65 124 76 129 84
       C134 70 136 52 140 36
       C144 52 146 70 151 84
       C156 76 152 65 158 52
       C162 62 160 75 165 82
       C175 95 188 108 188 128
       C188 152 168 172 140 172Z"
    fill="url(#midFlame)"
    opacity="0.95"
  >
    <animateTransform
      attributeName="transform"
      type="scale"
      values="1,1; 0.97,1.03; 1.02,0.97; 0.99,1.02; 1,1"
      dur="2.5s"
      repeatCount="indefinite"
      additive="sum"
      origin="140 172"
    />
  </path>

  <!-- Inner core -->
  <path
    d="M140 165
       C122 165 108 150 108 134
       C108 120 118 110 126 100
       C130 94 129 85 132 78
       C136 88 133 97 137 104
       C138 94 139 82 140 68
       C141 82 142 94 143 104
       C147 97 144 88 148 78
       C151 85 150 94 154 100
       C162 110 172 120 172 134
       C172 150 158 165 140 165Z"
    fill="url(#innerCore)"
    opacity="1"
  >
    <animateTransform
      attributeName="transform"
      type="scale"
      values="1,1; 1.04,0.97; 0.96,1.04; 1.03,0.98; 1,1"
      dur="2s"
      repeatCount="indefinite"
      additive="sum"
      origin="140 165"
    />
  </path>

  <!-- Flame tip glow -->
  <ellipse cx="140" cy="30" rx="12" ry="18" fill="${config.tipColor}" opacity="0.6" filter="url(#tipGlow)">
    <animate attributeName="opacity" values="0.6;0.9;0.5;0.8;0.6" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="ry" values="18;22;16;20;18" dur="2s" repeatCount="indefinite"/>
  </ellipse>`;
}

// ─── Ember particles ──────────────────────────────────────────────────────────

function buildEmbers(config: FlameConfig, level: FlameLevel): string {
  // More embers = higher flame level
  const emberCount = EMBER_COUNTS[level];
  const embers: string[] = [];

  // Pre-defined ember positions and timings for a natural look
  const emberData = [
    { cx: 118, dur: '3.2s', delay: '0s', rx: 2.5 },
    { cx: 155, dur: '2.8s', delay: '0.8s', rx: 2 },
    { cx: 130, dur: '3.8s', delay: '1.5s', rx: 1.5 },
    { cx: 148, dur: '2.5s', delay: '0.3s', rx: 2 },
    { cx: 125, dur: '4s', delay: '2s', rx: 1 },
    { cx: 160, dur: '3s', delay: '1.2s', rx: 1.5 },
    { cx: 112, dur: '3.5s', delay: '0.6s', rx: 2 },
    { cx: 165, dur: '2.7s', delay: '1.8s', rx: 1 },
  ];

  for (let i = 0; i < emberCount && i < emberData.length; i++) {
    const e = emberData[i]!;
    embers.push(`
  <ellipse cx="${e.cx}" cy="180" rx="${e.rx}" ry="${e.rx * 0.8}" fill="${config.color}" opacity="0">
    <animate attributeName="cy"      values="180;${80 - i * 8};${60 - i * 5}" dur="${e.dur}" begin="${e.delay}" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.9;0"                          dur="${e.dur}" begin="${e.delay}" repeatCount="indefinite"/>
    <animate attributeName="cx"      values="${e.cx};${e.cx + (i % 2 === 0 ? 8 : -8)};${e.cx + (i % 2 === 0 ? 14 : -14)}" dur="${e.dur}" begin="${e.delay}" repeatCount="indefinite"/>
  </ellipse>`);
  }

  return embers.join('\n');
}

// ─── Stats panel ─────────────────────────────────────────────────────────────

function buildStatsPanel(
  streak: number,
  totalContributions: number,
  level: FlameLevel,
  config: FlameConfig,
): string {
  const levelLabel = LEVEL_LABELS[level];
  const nextLevel = NEXT_MILESTONE[level];
  const streakLabel = streak === 1 ? 'day' : 'days';

  return `
  <!-- Section label -->
  <text x="240" y="44" font-family="${FONTS.sans}" font-size="11" font-weight="600"
    letter-spacing="1.5" fill="${COLORS.textMuted}">THE FORGE</text>

  <!-- Divider -->
  <line x1="240" y1="52" x2="480" y2="52" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Streak number — the hero stat -->
  <text x="240" y="100" font-family="${FONTS.sans}" font-size="52" font-weight="800"
    fill="${config.color}">${streak}</text>
  <text x="${240 + streak.toString().length * 30 + 4}" y="96"
    font-family="${FONTS.sans}" font-size="16" font-weight="500"
    fill="${COLORS.textSecondary}">${streakLabel}</text>

  <!-- Flame level label -->
  <text x="240" y="120" font-family="${FONTS.sans}" font-size="13" font-weight="600"
    fill="${config.color}">${escapeXml(levelLabel)}</text>

  <!-- Divider -->
  <line x1="240" y1="134" x2="480" y2="134" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Total contributions -->
  <text x="240" y="156" font-family="${FONTS.sans}" font-size="11" letter-spacing="0.8"
    fill="${COLORS.textMuted}">CONTRIBUTIONS THIS YEAR</text>
  <text x="240" y="176" font-family="${FONTS.sans}" font-size="20" font-weight="700"
    fill="${COLORS.textPrimary}">${totalContributions.toLocaleString()}</text>

  <!-- Next milestone hint -->
  <text x="240" y="200" font-family="${FONTS.sans}" font-size="11"
    fill="${COLORS.textMuted}">${escapeXml(nextLevel)}</text>`;
}

// ─── SVG defs ────────────────────────────────────────────────────────────────

function buildGradients(config: FlameConfig): string {
  return `
    <!-- Outer flame gradient — wide, cool edges -->
    <linearGradient id="outerFlame" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%"   stop-color="${config.base}"  stop-opacity="0.9"/>
      <stop offset="60%"  stop-color="${config.mid}"   stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${config.tip}"   stop-opacity="0.3"/>
    </linearGradient>

    <!-- Mid flame gradient -->
    <linearGradient id="midFlame" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%"   stop-color="${config.mid}"  stop-opacity="1"/>
      <stop offset="70%"  stop-color="${config.tip}"  stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${config.tipColor}" stop-opacity="0.4"/>
    </linearGradient>

    <!-- Inner core — hottest part -->
    <linearGradient id="innerCore" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%"   stop-color="#ffffff"     stop-opacity="0.95"/>
      <stop offset="40%"  stop-color="${config.tipColor}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${config.tip}"      stop-opacity="0.6"/>
    </linearGradient>

    <!-- Bottom accent bar -->
    <linearGradient id="bottomAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${config.color}"   stop-opacity="0"/>
      <stop offset="30%"  stop-color="${config.color}"   stop-opacity="1"/>
      <stop offset="70%"  stop-color="${config.color}"   stop-opacity="1"/>
      <stop offset="100%" stop-color="${config.color}"   stop-opacity="0"/>
    </linearGradient>`;
}

function buildFilters(config: FlameConfig): string {
  return `
    <filter id="flameBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <filter id="ambientGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>

    <filter id="tipGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="6"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 0"/>
    </filter>`;
}

function buildAnimations(level: FlameLevel): string {
  // Faster, more intense animations at higher flame levels
  const speed = ANIMATION_SPEEDS[level];
  return `
    <style>
      @keyframes flicker {
        0%, 100% { transform: scaleX(1) scaleY(1); }
        25%       { transform: scaleX(1.04) scaleY(0.97); }
        50%       { transform: scaleX(0.97) scaleY(1.04); }
        75%       { transform: scaleX(1.02) scaleY(0.98); }
      }
    </style>`;
}

// ─── Flame configuration per level ───────────────────────────────────────────
// Each level has its own color palette that feeds into the gradients.

interface FlameConfig {
  color: string; // Primary brand color — used for stats text and accents
  base: string; // Bottom of flame
  mid: string; // Middle of flame
  tip: string; // Top of flame
  tipColor: string; // Hottest inner tip color
}

const FLAME_CONFIG: Record<FlameLevel, FlameConfig> = {
  ember: {
    color: COLORS.flame.ember,
    base: '#3d1f0f',
    mid: '#7c3415',
    tip: '#c2410c',
    tipColor: '#f97316',
  },
  low: {
    color: COLORS.flame.low,
    base: '#7c2d12',
    mid: '#c2410c',
    tip: '#f97316',
    tipColor: '#fed7aa',
  },
  orange: {
    color: COLORS.flame.orange,
    base: '#c2410c',
    mid: '#f97316',
    tip: '#fdba74',
    tipColor: '#fff7ed',
  },
  blue: {
    color: COLORS.flame.blue,
    base: '#0c4a6e',
    mid: '#0ea5e9',
    tip: '#7dd3fc',
    tipColor: '#e0f2fe',
  },
  purple: {
    color: COLORS.flame.purple,
    base: '#3b0764',
    mid: '#9333ea',
    tip: '#d8b4fe',
    tipColor: '#faf5ff',
  },
  white: {
    color: COLORS.flame.white,
    base: '#475569',
    mid: '#cbd5e1',
    tip: '#f1f5f9',
    tipColor: '#ffffff',
  },
  scarlet: {
    color: COLORS.flame.scarlet,
    base: '#7f1d1d',
    mid: '#dc2626',
    tip: '#fca5a5',
    tipColor: '#fff1f2',
  },
};

// ─── Level metadata ───────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<FlameLevel, string> = {
  ember: '🪵 Ember — the fire begins',
  low: '🔥 Flame — consistency building',
  orange: '🔥 Forge — discipline forming',
  blue: '💙 Blue Core — mastery emerging',
  purple: '💜 Purple Fire — a year of showing up',
  white: '🤍 White Plasma — rare discipline',
  scarlet: '❤️ Scarlet — a force of nature',
};

const NEXT_MILESTONE: Record<FlameLevel, string> = {
  ember: '7 days → the flame catches',
  low: '30 days → the forge ignites',
  orange: '100 days → the blue core awakens',
  blue: '365 days → purple fire',
  purple: '730 days → white plasma',
  white: '1500 days → scarlet',
  scarlet: 'You are the fire. 🔥',
};

const EMBER_COUNTS: Record<FlameLevel, number> = {
  ember: 1,
  low: 2,
  orange: 3,
  blue: 5,
  purple: 6,
  white: 7,
  scarlet: 8,
};

const ANIMATION_SPEEDS: Record<FlameLevel, number> = {
  ember: 1,
  low: 1.2,
  orange: 1.5,
  blue: 1.8,
  purple: 2,
  white: 2.3,
  scarlet: 2.8,
};
