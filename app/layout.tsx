import type { Metadata } from 'next';
import { Inter, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  weight: ['400', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Jurex AI - Gestão de Empréstimos Pessoais',
  description: 'Gestão de empréstimos pessoais com inteligência artificial e análise de risco.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${hankenGrotesk.variable}`}>
      <body suppressHydrationWarning className="bg-[#f8f9fa] dark:bg-[#111314] text-[#191c1d] dark:text-[#e1e3e4] min-h-screen">
        {children}
      </body>
    </html>
  );
}
