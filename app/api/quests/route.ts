// ─────────────────────────────────────────────────────────────────────────────
// app/api/quests/route.ts
//
// The Quests card — shows what's currently being built.
// Reads from data/quests.json — update that file and push to refresh the card.
// Only shows "active" and "forging" quests. Complete ones stay in the JSON
// as history but don't appear on the card.
// ─────────────────────────────────────────────────────────────────────────────

import { getActiveQuests, type Quest } from '@/lib/data';
import { svgResponse, COLORS, FONTS, escapeXml } from '@/lib/svg';

export const runtime = 'edge';

export async function GET(): Promise<Response> {
  const quests = getActiveQuests();
  return svgResponse(buildQuestsSvg(quests));
}

function buildQuestsSvg(quests: Quest[]): string {
  const rowH = 54; // Height per quest row
  const headerH = 60; // Space for the header section
  const footerH = 24;
  const height = headerH + quests.length * rowH + footerH;

  return `
<svg
  width="495"
  height="${height}"
  viewBox="0 0 495 ${height}"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Active Quests — ${quests.length} in progress"
>
  <title>Active Quests — ${quests.length} in progress</title>

  <!-- Background -->
  <rect width="495" height="${height}" rx="10"
    fill="${COLORS.bgCard}" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Amber left bar — the workshop domain -->
  <rect x="0" y="0" width="4" height="${height}" rx="2" fill="${COLORS.amber}"/>

  <!-- Section label -->
  <text x="24" y="28" font-family="${FONTS.sans}" font-size="11" font-weight="600"
    letter-spacing="1.5" fill="${COLORS.amber}">THE WORKSHOP</text>

  <!-- Subtitle -->
  <text x="24" y="46" font-family="${FONTS.sans}" font-size="13"
    fill="${COLORS.textSecondary}">Things currently under construction</text>

  <!-- Divider -->
  <line x1="24" y1="56" x2="471" y2="56" stroke="${COLORS.bgCardBorder}" stroke-width="1"/>

  <!-- Quest rows -->
  ${quests.map((quest, i) => buildQuestRow(quest, headerH + i * rowH)).join('')}

  <!-- Bottom accent -->
  <rect x="0" y="${height - 4}" width="495" height="4" rx="2" fill="${COLORS.amber}" opacity="0.6"/>

</svg>`.trim();
}

function buildQuestRow(quest: Quest, y: number): string {
  const statusColor = STATUS_COLORS[quest.status] ?? COLORS.textMuted;
  const statusLabel = STATUS_LABELS[quest.status] ?? quest.status;

  // Description truncated to avoid overflow
  const maxDesc = 58;
  const desc =
    quest.description.length > maxDesc
      ? quest.description.slice(0, maxDesc - 1) + '…'
      : quest.description;

  // Pill width based on label length
  const pillW = statusLabel.length * 7 + 16;

  return `
  <!-- Quest: ${escapeXml(quest.name)} -->
  <g>
    <!-- Divider between rows (skip first) -->
    ${y > 60 ? `<line x1="24" y1="${y}" x2="471" y2="${y}" stroke="${COLORS.bgCardBorder}" stroke-width="0.5" opacity="0.5"/>` : ''}

    <!-- Emoji -->
    <text x="24" y="${y + 32}" font-size="20" font-family="${FONTS.sans}">${quest.emoji}</text>

    <!-- Quest name -->
    <text x="56" y="${y + 22}" font-family="${FONTS.sans}" font-size="14" font-weight="600"
      fill="${COLORS.textPrimary}">${escapeXml(quest.name)}</text>

    <!-- Description -->
    <text x="56" y="${y + 40}" font-family="${FONTS.sans}" font-size="12"
      fill="${COLORS.textSecondary}">${escapeXml(desc)}</text>

    <!-- Status pill -->
    <rect x="${471 - pillW}" y="${y + 12}" width="${pillW}" height="18" rx="9"
      fill="${statusColor}22" stroke="${statusColor}55" stroke-width="1"/>
    <text x="${471 - pillW / 2}" y="${y + 25}" font-family="${FONTS.sans}" font-size="11"
      font-weight="600" fill="${statusColor}" text-anchor="middle">${statusLabel}</text>
  </g>`;
}

// ─── Status metadata ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Quest['status'], string> = {
  active: COLORS.teal,
  forging: COLORS.amber,
  dreaming: COLORS.purple,
  complete: COLORS.green,
};

const STATUS_LABELS: Record<Quest['status'], string> = {
  active: 'Active',
  forging: 'Forging',
  dreaming: 'Dreaming',
  complete: 'Complete',
};
