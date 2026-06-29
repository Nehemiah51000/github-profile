// app/page.tsx
// The Kingdom of Technology — landing page at kingdom-stats.vercel.app
// Displays all five live SVG endpoints so visitors can see the kingdom in action.

export default function Home() {
  const BASE = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const endpoints = [
    {
      path: '/api/forge',
      label: 'The Forge',
      desc: 'Grows hotter with every day of discipline',
      width: 495,
      height: 230,
      span: 'full',
    },
    {
      path: '/api/map',
      label: 'The Map',
      desc: 'The kingdom expands as the streak grows',
      width: 495,
      height: 280,
      span: 'full',
    },
    {
      path: '/api/philosophy',
      label: 'Philosophy',
      desc: 'A different quote every day',
      width: 495,
      height: 160,
      span: 'half',
    },
    {
      path: '/api/weather',
      label: 'Creative Season',
      desc: 'Current state of the kingdom',
      width: 495,
      height: 140,
      span: 'half',
    },
    {
      path: '/api/quests',
      label: 'The Workshop',
      desc: "What's being forged right now",
      width: 495,
      height: 260,
      span: 'full',
    },
  ];

  return (
    <main style={styles.main}>
      {/* ── Hero ── */}
      <header style={styles.hero}>
        <p style={styles.eyebrow}>kingdom-stats.vercel.app</p>
        <h1 style={styles.heading}>🏰 Kingdom of Technology</h1>
        <p style={styles.subheading}>
          A living GitHub profile. Every card below is a real SVG endpoint — the
          same images embedded in the README update automatically.
        </p>
      </header>

      {/* ── Live endpoint cards ── */}
      <section style={styles.grid}>
        {endpoints.map((e) => (
          <article
            key={e.path}
            style={{
              ...styles.card,
              gridColumn: e.span === 'full' ? '1 / -1' : 'auto',
            }}>
            {/* Card header */}
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>{e.label}</h2>
                <p style={styles.cardDesc}>{e.desc}</p>
              </div>
              <code style={styles.pill}>{e.path}</code>
            </div>

            {/* Live SVG preview — loaded directly from the API */}
            <div style={styles.previewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE}${e.path}`}
                alt={e.label}
                width={e.width}
                height={e.height}
                style={styles.preview}
              />
            </div>

            {/* Raw embed code visitors can copy */}
            <details style={styles.details}>
              <summary style={styles.summary}>README embed code</summary>
              <pre
                style={
                  styles.code
                }>{`![${e.label}](https://kingdom-stats.vercel.app${e.path})`}</pre>
            </details>
          </article>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Built by Nesh · Every commit expands the kingdom
        </p>
        <a
          href='https://github.com/YOUR_USERNAME/kingdom-stats'
          style={styles.footerLink}>
          View source on GitHub →
        </a>
      </footer>
    </main>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
// All inline — no external CSS file needed for a single page.
// Palette matches the SVG cards: same bg (#1c2024) and accents.

const styles: Record<string, React.CSSProperties> = {
  main: {
    background: '#0d1117',
    minHeight: '100vh',
    color: '#eaeef2',
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    padding: '0 0 80px',
  },

  // ── Hero ──
  hero: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '72px 24px 48px',
    textAlign: 'center',
  },
  eyebrow: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: '0.12em',
    color: '#484f58',
    marginBottom: 16,
    textTransform: 'uppercase' as const,
  },
  heading: {
    fontSize: 36,
    fontWeight: 700,
    margin: '0 0 16px',
    lineHeight: 1.2,
    color: '#eaeef2',
  },
  subheading: {
    fontSize: 16,
    color: '#8b949e',
    lineHeight: 1.7,
    maxWidth: 480,
    margin: '0 auto',
  },

  // ── Grid ──
  grid: {
    maxWidth: 1060,
    margin: '0 auto',
    padding: '0 24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
  },

  // ── Card ──
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    padding: '20px 24px 0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: '0 0 4px',
    color: '#eaeef2',
  },
  cardDesc: {
    fontSize: 13,
    color: '#8b949e',
    margin: 0,
    lineHeight: 1.5,
  },
  pill: {
    flexShrink: 0,
    fontSize: 11,
    fontFamily: 'monospace',
    background: '#21262d',
    border: '1px solid #30363d',
    borderRadius: 20,
    padding: '4px 10px',
    color: '#f97316',
    whiteSpace: 'nowrap' as const,
  },

  // ── Preview ──
  previewWrap: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'center',
  },
  preview: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
    display: 'block',
  },

  // ── Embed code ──
  details: {
    borderTop: '1px solid #21262d',
  },
  summary: {
    fontSize: 12,
    color: '#484f58',
    padding: '10px 24px',
    cursor: 'pointer',
    letterSpacing: '0.05em',
    userSelect: 'none' as const,
  },
  code: {
    margin: 0,
    padding: '12px 24px 16px',
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#8b949e',
    background: '#0d1117',
    overflowX: 'auto' as const,
    whiteSpace: 'pre' as const,
  },

  // ── Footer ──
  footer: {
    maxWidth: 680,
    margin: '48px auto 0',
    padding: '0 24px',
    textAlign: 'center',
    borderTop: '1px solid #21262d',
    paddingTop: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#484f58',
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 13,
    color: '#f97316',
    textDecoration: 'none',
  },
};
