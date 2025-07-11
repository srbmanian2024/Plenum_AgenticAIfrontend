import React from 'react';
import AppSidebar from '@/components/app-sidebar';
import ArtifactRoot from '@/components/artifact/artifact-root';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
});

const title = 'plenum';
const description =
  'A fully AI-powered answer engine with a generative UI.';

export const metadata: Metadata = {
  metadataBase: new URL('https://plenum.ai'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@initialp00'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser }
    } = await supabase.auth.getUser();
    user = supabaseUser;
  }

  return (
   <html lang="en" className="h-full">
  <body className={cn("h-full flex font-sans antialiased", fontSans.variable)}>
    <ThemeProvider>
      <SidebarProvider defaultOpen>
        <div className="flex w-full h-full">
          {/* Sidebar - fixed height full screen */}
          <AppSidebar />

          {/* Content wrapper (Header + scrollable main) */}
          <div className="flex flex-col flex-1 h-full min-h-0">
            {/* Fixed header height */}
            <Header user={user} />

            {/* Scrollable content below header */}
            <main className="flex-1 overflow-y-auto min-h-0">
              <ArtifactRoot>{children}</ArtifactRoot>
            </main>
          </div>
        </div>

        <Toaster />
        <Analytics />
      </SidebarProvider>
    </ThemeProvider>
  </body>
</html>

  );
}
