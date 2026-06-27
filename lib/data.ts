// ─────────────────────────────────────────────────────────────────────────────
// lib/data.ts
//
// Typed accessors for everything in /data/*.json
//
// Why not just import JSON directly in each route?
// Because this gives us one place to add validation, fallbacks, and type safety.
// Every route calls these functions — none of them read files directly.
// ─────────────────────────────────────────────────────────────────────────────

import quotesRaw from '@/data/quotes.json';
import questsRaw from '@/data/quests.json';
import seasonRaw from '@/data/season.json';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Quote {
  id: string;
  text: string;
  context: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'forging' | 'dreaming' | 'complete';
  emoji: string;
  url: string;
}

export interface SeasonDefinition {
  emoji: string;
  label: string;
  color: string;
  description: string;
}

export interface Season {
  current: string;
  detail: string;
  updatedAt: string;
  seasons: Record<string, SeasonDefinition>;
}

// ─── Accessors ────────────────────────────────────────────────────────────────

/** Returns all quotes */
export function getQuotes(): Quote[] {
  return quotesRaw as Quote[];
}

/**
 * Returns a single quote.
 * Uses the current minute as a seed so the quote changes every minute
 * but is consistent for everyone who loads the card at the same time.
 * (True random would produce a different image every request, busting the CDN cache.)
 */
export function getDailyQuote(): Quote {
  const quotes = getQuotes();
  // Seed by day so the quote stays stable for a full day, then rotates
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const index = dayOfYear % quotes.length;
  return quotes[index] ?? quotes[0]!;
}

/** Returns all quests, optionally filtered by status */
export function getQuests(status?: Quest['status']): Quest[] {
  const quests = questsRaw as Quest[];
  if (!status) return quests;
  return quests.filter((q) => q.status === status);
}

/** Returns active + forging quests — what's shown in the README */
export function getActiveQuests(): Quest[] {
  return (questsRaw as Quest[]).filter(
    (q) => q.status === 'active' || q.status === 'forging',
  );
}

/** Returns the current season and its definition */
export function getCurrentSeason(): {
  key: string;
  definition: SeasonDefinition;
  detail: string;
  updatedAt: string;
} {
  const data = seasonRaw as unknown as Season;
  const key = data.current;
  const definition = data.seasons[key];

  if (!definition) {
    // Fallback — should never happen if season.json is valid
    return {
      key: 'forging',
      definition: {
        emoji: '🔥',
        label: 'Forging',
        color: '#f97316',
        description: 'Deep in the build',
      },
      detail: data.detail,
      updatedAt: data.updatedAt,
    };
  }

  return { key, definition, detail: data.detail, updatedAt: data.updatedAt };
}
