// The root page — shown at kingdom-stats.vercel.app
// Not part of the GitHub README; just a friendly door for curious humans.

export default function Home() {
  const endpoints = [
    {
      path: '/api/forge',
      label: 'The Forge',
      desc: 'Animated flame — grows with streak',
    },
    {
      path: '/api/philosophy',
      label: 'Philosophy',
      desc: 'A random quote from the Kingdom',
    },
    {
      path: '/api/quests',
      label: 'Quests',
      desc: "What's currently being built",
    },
    {
      path: '/api/weather',
      label: 'Creative Season',
      desc: 'Current creative state',
    },
    { path: '/api/map', label: 'The Map', desc: 'The kingdom as it grows' },
  ];

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 640,
        margin: '80px auto',
        padding: '0 24px',
      }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
        🏰 Kingdom of Technology
      </h1>
      <p style={{ color: '#666', marginBottom: 48 }}>
        The living API powering Nesh&aps;s GitHub profile. Every endpoint
        returns an SVG image.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {endpoints.map((e) => (
          <a
            key={e.path}
            href={e.path}
            style={{
              display: 'block',
              padding: '16px 20px',
              border: '1px solid #e5e5e5',
              borderRadius: 10,
              textDecoration: 'none',
              color: 'inherit',
            }}>
            <div style={{ fontWeight: 600 }}>{e.label}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
              {e.desc}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#aaa',
                marginTop: 4,
                fontFamily: 'monospace',
              }}>
              {e.path}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
