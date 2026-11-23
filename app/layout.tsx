/**
 * The root layout is the top-level component wrapping all pages
 * in the application. It replaces `_app.tsx` and `_document.tsx`
 * from the Pages Router.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @license MIT
 * @see https://comp426-25f.github.io/
 */

import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Header from "@/components/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TRPCReactProvider } from "@/utils/trpc/provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Tarillion",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `suppressHydrationWarning` is required by `next-themes`, which updates
    // the `class` attribute on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            {/* The header is then shown above all pages. */}
            <div className="flex h-screen flex-col px-4">
              <Header />
              <ScrollArea className="flex flex-1 flex-col">
                {children}
              </ScrollArea>
            </div>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
