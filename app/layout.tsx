import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CPM MamoBall',
  description: 'Copa MamoBall — plataforma oficial da liga',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300..900&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: '#0a0c08' }}>
        {children}
      </body>
    </html>
  );
}
