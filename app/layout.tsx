import type {Metadata} from 'next';
import { Space_Grotesk, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css'; // Global styles

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kroket & Grapes-Yakukt - Student Food & High-Performance hub',
  description: 'A powerful, fast student cafeteria ordering hub and split-billing platform with Neo-Brutalist style and glassmorphism flow.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${plusJakarta.variable}`}>
      <body className="font-sans bg-zinc-950 text-zinc-100 min-h-screen selection:bg-yellow-400 selection:text-black antialiased overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
