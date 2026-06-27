#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/sync.mjs
//
// The Kingdom Sync CLI — run with: pnpm sync
//
// Lets you update quotes, quests, and season without opening JSON files.
// Works offline: changes are saved locally and pushed the next time you're online.
//
// Usage:
//   pnpm sync              → interactive menu
//   pnpm sync --status     → show current kingdom data
//   pnpm sync --push       → git add + commit + push all data changes
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync } from "fs";
import { createInterface }                          from "readline";
import { execSync }                                 from "child_process";
import { join, dirname }                            from "path";
import { fileURLToPath }                            from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, "..", "data");

// ─── File paths ───────────────────────────────────────────────────────────────

const PATHS = {
  quotes: join(DATA_DIR, "quotes.json"),
  quests: join(DATA_DIR, "quests.json"),
  season: join(DATA_DIR, "season.json"),
};

// ─── Readline interface ───────────────────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function isOnline() {
  try {
    execSync("curl -s --max-time 2 https://github.com > /dev/null 2>&1");
    return true;
  } catch {
    return false;
  }
}

function gitPush() {
  try {
    execSync("git add data/", { stdio: "inherit" });
    execSync(`git commit -m "sync: update kingdom data [${new Date().toISOString().slice(0, 10)}]"`, { stdio: "inherit" });
    execSync("git push", { stdio: "inherit" });
    console.log("\n✅ Kingdom data pushed. Vercel will redeploy automatically.\n");
  } catch (err) {
    console.error("\n❌ Git push failed:", err.message);
    console.log("   Changes are saved locally. Run `pnpm sync --push` when back online.\n");
  }
}

// ─── Commands ─────────────────────────────────────────────────────────────────

function showStatus() {
  const quotes = readJson(PATHS.quotes);
  const quests = readJson(PATHS.quests);
  const season = readJson(PATHS.season);
  const def    = season.seasons[season.current];

  console.log("\n🏰 Kingdom Status\n");
  console.log(`  Season  : ${def.emoji} ${def.label} — "${season.detail}"`);
  console.log(`  Updated : ${season.updatedAt}`);
  console.log(`  Quotes  : ${quotes.length} in rotation`);
  console.log(`  Quests  : ${quests.filter((q) => q.status === "active" || q.status === "forging").length} active / ${quests.length} total`);
  console.log();
}

async function updateSeason() {
  const data    = readJson(PATHS.season);
  const keys    = Object.keys(data.seasons);

  console.log("\n🌤  Update Creative Season\n");
  console.log("Available seasons:");
  keys.forEach((k, i) => {
    const s = data.seasons[k];
    const marker = k === data.current ? " ← current" : "";
    console.log(`  ${i + 1}. ${s.emoji} ${s.label}${marker}`);
  });

  const choice = await ask("\nEnter number (or Enter to cancel): ");
  const idx    = parseInt(choice, 10) - 1;

  if (isNaN(idx) || idx < 0 || idx >= keys.length) {
    console.log("Cancelled.\n");
    return;
  }

  const key    = keys[idx];
  const detail = await ask(`Detail text (e.g. "Building the Kingdom"): `);

  data.current   = key;
  data.detail    = detail || data.seasons[key].description;
  data.updatedAt = new Date().toISOString().slice(0, 10);

  writeJson(PATHS.season, data);
  console.log(`\n✅ Season updated to: ${data.seasons[key].emoji} ${data.seasons[key].label}\n`);
}

async function addQuote() {
  console.log("\n💬 Add a Philosophy Quote\n");

  const text    = await ask("Quote text: ");
  const context = await ask("Context / source (e.g. 'On building'): ");

  if (!text.trim()) {
    console.log("Cancelled — quote cannot be empty.\n");
    return;
  }

  const quotes = readJson(PATHS.quotes);
  const id     = `q${String(quotes.length + 1).padStart(3, "0")}`;

  quotes.push({ id, text: text.trim(), context: context.trim() || "The Kingdom" });
  writeJson(PATHS.quotes, quotes);
  console.log(`\n✅ Quote added (${id}). Total: ${quotes.length}\n`);
}

async function addQuest() {
  console.log("\n⚒️  Add a Quest\n");

  const name        = await ask("Project name: ");
  const description = await ask("Description (one line): ");
  const emoji       = await ask("Emoji: ");
  const url         = await ask("URL (optional): ");

  if (!name.trim()) {
    console.log("Cancelled.\n");
    return;
  }

  const quests = readJson(PATHS.quests);
  const id     = `quest${String(quests.length + 1).padStart(3, "0")}`;

  quests.push({
    id,
    name:        name.trim(),
    description: description.trim(),
    status:      "forging",
    emoji:       emoji.trim() || "⚒️",
    url:         url.trim(),
  });

  writeJson(PATHS.quests, quests);
  console.log(`\n✅ Quest added: ${name} (status: forging)\n`);
}

async function updateQuestStatus() {
  const quests  = readJson(PATHS.quests);
  const active  = quests.filter((q) => q.status !== "complete");

  if (active.length === 0) {
    console.log("\nNo active quests.\n");
    return;
  }

  console.log("\n⚒️  Update Quest Status\n");
  active.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.emoji} ${q.name} [${q.status}]`);
  });

  const qChoice  = await ask("\nQuest number: ");
  const quest    = active[parseInt(qChoice, 10) - 1];

  if (!quest) {
    console.log("Invalid choice.\n");
    return;
  }

  console.log("\nStatuses: active | forging | dreaming | complete");
  const status = await ask(`New status for "${quest.name}": `);
  const valid  = ["active", "forging", "dreaming", "complete"];

  if (!valid.includes(status)) {
    console.log("Invalid status.\n");
    return;
  }

  const idx = quests.findIndex((q) => q.id === quest.id);
  quests[idx].status = status;
  writeJson(PATHS.quests, quests);
  console.log(`\n✅ "${quest.name}" → ${status}\n`);
}

// ─── Main menu ────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // Shortcut flags
  if (args.includes("--status")) { showStatus(); rl.close(); return; }
  if (args.includes("--push"))   { gitPush();   rl.close(); return; }

  console.log("\n🏰 Kingdom Sync\n");

  let running = true;
  while (running) {
    console.log("What would you like to update?\n");
    console.log("  1. View kingdom status");
    console.log("  2. Update creative season 🌤");
    console.log("  3. Add a philosophy quote 💬");
    console.log("  4. Add a new quest ⚒️");
    console.log("  5. Update quest status");
    console.log("  6. Push changes to GitHub (deploys automatically)");
    console.log("  7. Exit\n");

    const choice = await ask("Choice: ");

    switch (choice.trim()) {
      case "1": showStatus();           break;
      case "2": await updateSeason();   break;
      case "3": await addQuote();       break;
      case "4": await addQuest();       break;
      case "5": await updateQuestStatus(); break;
      case "6":
        if (isOnline()) {
          gitPush();
        } else {
          console.log("\n⚠️  Offline — changes saved locally. Run `pnpm sync --push` when back online.\n");
        }
        break;
      case "7":
        running = false;
        break;
      default:
        console.log("Invalid choice.\n");
    }
  }

  rl.close();
  console.log("\n👋 Stay disciplined. The forge is watching.\n");
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
