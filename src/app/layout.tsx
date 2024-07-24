import { Inter } from "next/font/google";
import { LanguageProvider } from "@inlang/paraglide-next";

import { cn } from "~/lib/utils";
import * as m from "~/paraglide/messages.js";
import { languageTag } from "~/paraglide/runtime.js";
import { AI } from "./_ai/actions";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata() {
  return {
    title: m.title(),
    description: m.meta_description(),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <html lang={languageTag()}>
        <body
          className={cn(
            "bg-background font-sans text-foreground antialiased",
            inter.variable,
          )}
        >
          <AI>{children}</AI>
        </body>
      </html>
    </LanguageProvider>
  );
}
