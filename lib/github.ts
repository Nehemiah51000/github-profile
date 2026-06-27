// ─────────────────────────────────────────────────────────────────────────────
// lib/github.ts
//
// Fetches contribution and streak data from the GitHub GraphQL API.
// All GitHub logic is isolated here — no API call logic leaks into route files.
//
// The GitHub REST API doesn't expose streak data, so we use GraphQL to pull
// the full contribution calendar and calculate streak ourselves.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContributionDay {
  date: string; // "2024-06-01"
  contributionCount: number;
}

export interface GitHubStats {
  streak: number; // Current streak in days
  totalContributions: number; // Contributions in the last year
  longestStreak: number; // Longest streak ever (in the calendar year)
  contributionDays: ContributionDay[]; // Raw daily data — useful for the map endpoint
}

// ─── GraphQL query ────────────────────────────────────────────────────────────
// Fetches the last 365 days of contribution data in one request

const CONTRIBUTION_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

// ─── Main fetch function ──────────────────────────────────────────────────────

/**
 * Fetches GitHub contribution stats for the configured username.
 * Returns safe fallback values if the API is unreachable (e.g. during local
 * dev without a token, or if GitHub is down).
 */
export async function getGitHubStats(): Promise<GitHubStats> {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  // Graceful fallback — never crash the endpoint because of missing env vars
  if (!username || !token) {
    console.warn(
      '[github] GITHUB_USERNAME or GITHUB_TOKEN not set — returning mock data',
    );
    return mockStats();
  }

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': `kingdom-stats/${username}`,
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { username },
      }),
      // Next.js fetch cache — revalidate every 5 minutes
      // This means the flame only recalculates every 5 min, not on every request
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`[github] API responded ${res.status}`);
      return mockStats();
    }

    const json = (await res.json()) as GitHubGraphQLResponse;

    if (json.errors) {
      console.error('[github] GraphQL errors:', json.errors);
      return mockStats();
    }

    const calendar =
      json.data.user.contributionsCollection.contributionCalendar;

    // Flatten weeks → days and sort chronologically
    const days: ContributionDay[] = calendar.weeks
      .flatMap((w) => w.contributionDays)
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      streak: calculateCurrentStreak(days),
      longestStreak: calculateLongestStreak(days),
      totalContributions: calendar.totalContributions,
      contributionDays: days,
    };
  } catch (err) {
    console.error('[github] Fetch failed:', err);
    return mockStats();
  }
}

// ─── Streak calculations ──────────────────────────────────────────────────────

/**
 * Calculates the current streak by walking backwards from today.
 * A streak continues as long as each consecutive day has ≥1 contribution.
 * Today without a contribution doesn't break the streak (it's still today).
 */
function calculateCurrentStreak(days: ContributionDay[]): number {
  const today = todayString();
  let streak = 0;

  // Walk backwards from the most recent day
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];

    // Skip today if no contribution yet — doesn't reset the streak
    if (day!.date === today && day!.contributionCount === 0) continue;

    if (day!.contributionCount > 0) {
      streak++;
    } else {
      break; // Gap found — streak ends
    }
  }

  return streak;
}

/** Calculates the longest streak within the returned calendar data */
function calculateLongestStreak(days: ContributionDay[]): number {
  let longest = 0;
  let current = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

/** Returns today's date as "YYYY-MM-DD" in UTC */
function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Flame level ──────────────────────────────────────────────────────────────

/**
 * Maps a streak number to a flame level identifier.
 * Used by /api/forge to pick the right flame SVG and color.
 */
export type FlameLevel =
  | 'ember' // 0–6
  | 'low' // 7–29
  | 'orange' // 30–99
  | 'blue' // 100–364
  | 'purple' // 365–729
  | 'white' // 730–1499
  | 'scarlet'; // 1500+

export function getFlameLevel(streak: number): FlameLevel {
  if (streak >= 1500) return 'scarlet';
  if (streak >= 730) return 'white';
  if (streak >= 365) return 'purple';
  if (streak >= 100) return 'blue';
  if (streak >= 30) return 'orange';
  if (streak >= 7) return 'low';
  return 'ember';
}

// ─── Mock data for local dev ──────────────────────────────────────────────────
// Used when env vars aren't set — lets you develop without hitting the API

function mockStats(): GitHubStats {
  return {
    streak: 42,
    longestStreak: 65,
    totalContributions: 847,
    contributionDays: [],
  };
}

// ─── Internal types ───────────────────────────────────────────────────────────

interface GitHubGraphQLResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: ContributionDay[];
          }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}
