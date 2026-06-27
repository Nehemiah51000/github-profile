// ─────────────────────────────────────────────────────────────────────────────
// app/api/philosophy/route.ts
//
// Returns a daily quote card as SVG.
// The quote rotates once per day — same quote for all visitors on the same day
// so the CDN cache stays warm and GitHub doesn't see a new image every request.
// ─────────────────────────────────────────────────────────────────────────────

import { getDailyQuote } from '@/lib/data';
import { svgResponse, COLORS, FONTS, escapeXml, wrapText } from '@/lib/svg';

export const runtime = 'edge';

export async function GET(): Promise<Response> {
  const quote = getDailyQuote();
  return svgResponse(buildPhilosophySvg(quote.text, quote.context));
}

function buildPhilosophySvg(text: string, context: string): string {
  const lines = wrapText(text, 52);
  const height = Math.max(140, 72 + lines.length * 26 + 44);
  const lineY = (i: number) => 80 + i * 26;

  return `
<svg
  width="495"
  height="${height}"
  viewBox="0 0 495 ${height}"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Philosophy — ${escapeXml(text)}"
>
  <title>Philosophy — ${escapeXml(text)}</title>

  <!-- Background -->
  <rect width="495" height="${height}" rx="10"
    fill="${COLORS.bgCard}" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Purple left accent bar — philosophy is always the purple domain -->
  <rect x="0" y="0" width="4" height="${height}" rx="2" fill="${COLORS.purple}"/>

  <!-- Section label -->
  <text x="24" y="36" font-family="${FONTS.sans}" font-size="11" font-weight="600"
    letter-spacing="1.5" fill="${COLORS.purple}">PHILOSOPHY</text>

  <!-- Divider -->
  <line x1="24" y1="46" x2="471" y2="46" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Opening quotation mark — decorative -->
  <text x="20" y="76" font-family="${FONTS.sans}" font-size="36" font-weight="800"
    fill="${COLORS.purple}" opacity="0.3">"</text>

  <!-- Quote text — wrapped lines -->
  ${lines
    .map(
      (line, i) => `
  <text x="40" y="${lineY(i)}"
    font-family="${FONTS.sans}"
    font-size="15"
    font-weight="${i === 0 ? '500' : '400'}"
    fill="${COLORS.textPrimary}"
  >${escapeXml(line)}</text>`,
    )
    .join('')}

  <!-- Closing quotation mark -->
  <text x="460" y="${lineY(lines.length) - 4}"
    font-family="${FONTS.sans}" font-size="36" font-weight="800"
    fill="${COLORS.purple}" opacity="0.3" text-anchor="end">"</text>

  <!-- Context / source label -->
  <text x="40" y="${lineY(lines.length) + 22}"
    font-family="${FONTS.sans}" font-size="12"
    fill="${COLORS.textSecondary}" font-style="italic"
  >— ${escapeXml(context)}</text>

  <!-- Bottom accent -->
  <rect x="0" y="${height - 4}" width="495" height="4" rx="2">
    <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
    <animate attributeName="fill" values="${COLORS.purple};${COLORS.blue};${COLORS.purple}" dur="8s" repeatCount="indefinite"/>
  </rect>

</svg>`.trim();
}
