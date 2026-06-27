// This layout exists purely to satisfy Next.js App Router requirements.
// The kingdom has no frontend pages — only API routes that return SVGs.
// If you ever want to add a live preview page at kingdom-stats.vercel.app,
// build it here.

export const metadata = {
  title: 'Kingdom of Technology — Stats API',
  description: "The living API powering Nesh's GitHub profile.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
