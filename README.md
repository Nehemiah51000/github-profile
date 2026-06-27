# 🏰 Kingdom of Technology — Stats API

> The living engine behind [Nesh's GitHub profile](https://github.com/YOUR_USERNAME).
> Every section of the README is a living SVG served from this Next.js app.

---

## What this is

This is a **Next.js API server** deployed on Vercel. It has no frontend.

Your GitHub profile README contains image tags pointing at this server:

```md
![Forge](https://kingdom-stats.vercel.app/api/forge)
```

GitHub fetches that URL, this server responds with an SVG, GitHub displays it. That's the entire trick. No JS runs in the README — just images served from here.

---

## Project structure

```
kingdom-stats/
│
├── app/
│   ├── layout.tsx              # Required by Next.js — ignore
│   ├── page.tsx                # Root page listing all endpoints
│   └── api/
│       ├── forge/route.ts      # 🔥 The flame — grows with GitHub streak
│       ├── philosophy/route.ts # 💬 Random quote from your quotes file
│       ├── quests/route.ts     # ⚒️  Current projects card
│       ├── weather/route.ts    # 🌤  Creative season card
│       └── map/route.ts        # 🗺️  The growing kingdom map SVG
│
├── lib/
│   ├── svg.ts                  # Shared SVG building blocks & color tokens
│   ├── github.ts               # GitHub API — fetches streak & contributions
│   └── data.ts                 # Reads & types the JSON data files
│
├── data/
│   ├── quotes.json             # Your philosophy quotes — edit freely
│   ├── quests.json             # Active projects — edit freely
│   └── season.json             # Current creative season — edit freely
│
├── scripts/
│   └── sync.mjs                # CLI tool: run `pnpm sync` to update data files
│                               # Works offline — queues changes, pushes when online
│
├── .env.example                # Copy to .env.local and fill in secrets
├── vercel.json                 # Vercel deploy config
└── README.md                   # You are here
```

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/kingdom-stats
cd kingdom-stats
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

- `GITHUB_USERNAME` — your GitHub handle
- `GITHUB_TOKEN` — a [Personal Access Token](https://github.com/settings/tokens) with `read:user` scope

### 3. Run locally

```bash
pnpm dev
```

Visit `http://localhost:3000` to see all endpoints listed.
Visit `http://localhost:3000/api/forge` to see the flame SVG.

### 4. Deploy to Vercel

```bash
pnpm i -g vercel
vercel
```

On the Vercel dashboard, add your environment variables under:
**Project → Settings → Environment Variables**

### 5. Wire up the README

In your GitHub profile README (`YOUR_USERNAME/YOUR_USERNAME`), use:

```md
![Forge](https://kingdom-stats.vercel.app/api/forge)
![Season](https://kingdom-stats.vercel.app/api/weather)
![Quests](https://kingdom-stats.vercel.app/api/quests)
![Philosophy](https://kingdom-stats.vercel.app/api/philosophy)
![Map](https://kingdom-stats.vercel.app/api/map)
```

---

## Updating content

### Adding a quote

Open `data/quotes.json` and add a new entry. Push to git. Done.

### Updating active quests

Open `data/quests.json`, edit the list. Push to git.

### Changing your creative season

Open `data/season.json`, change `current`. Push to git.

### Using the sync CLI (faster)

```bash
pnpm sync
```

Interactive prompts let you update any data file without opening JSON.
Works offline — queues changes and syncs when you reconnect.

---

## How the flame levels work

The forge flame in `/api/forge` evolves based on your GitHub contribution streak:

| Streak        | Flame state                           |
| ------------- | ------------------------------------- |
| 0–6 days      | 🪵 Ember — just getting started       |
| 7–29 days     | 🔥 Flame — consistency building       |
| 30–99 days    | 🔥 Orange fire — discipline forming   |
| 100–364 days  | 💙 Blue core — mastery emerging       |
| 365–729 days  | 💜 Purple fire — a year of showing up |
| 730–1499 days | 🤍 White plasma — rare discipline     |
| 1500+ days    | ❤️ Scarlet — a force of nature        |

---

## Adding new endpoints

1. Create `app/api/YOUR_ENDPOINT/route.ts`
2. Export a `GET` function that returns `svgResponse(yourSvgString)` from `@/lib/svg`
3. Done — it's live on the next deploy

---

## Philosophy

> Technology should amplify human potential, not replace it.

Every endpoint here is a small proof of that belief.
The kingdom grows one commit at a time.
