// ─────────────────────────────────────────────────────────────────────────────
// lib/svg.ts
//
// Everything SVG lives here — design tokens, helper functions, and the
// response wrapper every API route uses.
//
// Why one file for all of this?
// Because when you come back in a year and want to change "the kingdom's
// amber" you change ONE line and every endpoint updates on next deploy.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Design tokens ────────────────────────────────────────────────────────────
// The kingdom's visual language. Every color used across all endpoints lives here.

export const COLORS = {
  // Backgrounds
  bg: '#0d1117', // GitHub dark — blends seamlessly into dark profiles
  bgCard: '#161b22', // Slightly lighter — used for card surfaces
  bgCardBorder: '#30363d', // Subtle border between card and background

  // Text
  textPrimary: '#e6edf3', // Headings, important values
  textSecondary: '#8b949e', // Labels, metadata, supporting text
  textMuted: '#484f58', // Placeholders, dividers

  // Brand — the kingdom palette
  amber: '#f97316', // The forge / fire
  gold: '#fbbf24', // Achievements, highlights
  teal: '#2dd4bf', // Exploration, growth
  purple: '#a78bfa', // Dreams, philosophy
  blue: '#38bdf8', // Systems, clarity
  green: '#4ade80', // Planting, new beginnings
  slate: '#94a3b8', // Neutral, climbing
  coral: '#fb7185', // Music, emotion

  // Flame levels — the forge progression
  flame: {
    ember: '#6b4226', // 0–6 days   — just wood
    low: '#c2410c', // 7–29 days  — flame catching
    orange: '#f97316', // 30–99 days — consistent fire
    blue: '#38bdf8', // 100–364    — mastery emerging
    purple: '#a78bfa', // 365–729    — a year of discipline
    white: '#e2e8f0', // 730–1499   — rare & bright
    scarlet: '#ef4444', // 1500+      — force of nature
  },
} as const;

export const FONTS = {
  // GitHub's SVG renderer supports a limited set of system fonts
  sans: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  mono: "'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace",
} as const;

export const CARD = {
  width: 495,
  height: 195,
  borderRadius: 10,
  padding: 24,
} as const;

// ─── Response helper ──────────────────────────────────────────────────────────
// Every API route calls this instead of constructing a Response manually.
// Sets the correct Content-Type so GitHub renders it as an image.

export function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // Prevent GitHub from caching a stale version forever
      // s-maxage=300 = CDN holds it 5 min, then re-fetches from Vercel
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

// ─── SVG wrapper ─────────────────────────────────────────────────────────────
// Wraps any inner SVG content in a standard card shell.
// width / height can be overridden for non-standard cards (e.g. the map).

export function cardShell({
  width = CARD.width,
  height = CARD.height,
  title,
  children,
}: {
  width?: number;
  height?: number;
  title: string;
  children: string;
}): string {
  return `
<svg
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="${title}"
>
  <title>${title}</title>

  <!-- Card background -->
  <rect
    width="${width}"
    height="${height}"
    rx="${CARD.borderRadius}"
    fill="${COLORS.bgCard}"
    stroke="${COLORS.bgCardBorder}"
    stroke-width="1"
  />

  ${children}
</svg>`.trim();
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

/** Renders a section label — small, muted, uppercase */
export function label(text: string, x: number, y: number): string {
  return `
  <text
    x="${x}" y="${y}"
    font-family="${FONTS.sans}"
    font-size="11"
    font-weight="600"
    letter-spacing="1.2"
    fill="${COLORS.textSecondary}"
    text-anchor="start"
  >${text.toUpperCase()}</text>`;
}

/** Renders a primary heading */
export function heading(text: string, x: number, y: number, size = 18): string {
  return `
  <text
    x="${x}" y="${y}"
    font-family="${FONTS.sans}"
    font-size="${size}"
    font-weight="700"
    fill="${COLORS.textPrimary}"
    text-anchor="start"
  >${escapeXml(text)}</text>`;
}

/** Renders body text */
export function body(
  text: string,
  x: number,
  y: number,
  color = COLORS.textSecondary,
  size = 13,
): string {
  return `
  <text
    x="${x}" y="${y}"
    font-family="${FONTS.sans}"
    font-size="${size}"
    fill="${color}"
    text-anchor="start"
  >${escapeXml(text)}</text>`;
}

/** Renders a coloured pill/badge */
export function pill(
  text: string,
  x: number,
  y: number,
  color: string,
): string {
  const w = text.length * 7 + 16;
  return `
  <g>
    <rect x="${x}" y="${y - 13}" width="${w}" height="18" rx="9" fill="${color}22" stroke="${color}55" stroke-width="1"/>
    <text
      x="${x + w / 2}" y="${y}"
      font-family="${FONTS.sans}"
      font-size="11"
      font-weight="600"
      fill="${color}"
      text-anchor="middle"
    >${escapeXml(text)}</text>
  </g>`;
}

/** Horizontal divider line */
export function divider(
  y: number,
  x1 = CARD.padding,
  x2 = CARD.width - CARD.padding,
): string {
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>`;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Escapes characters that would break SVG XML */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wraps text at a given character width, returning an array of lines.
 * Used for quote cards and description text that might overflow.
 */
export function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}
