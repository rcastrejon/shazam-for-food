import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { cn } from "~/lib/utils";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Shazam for Food",
  description: "It's like Shazam, but for food.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("bg-background font-sans antialiased", inter.variable)}
      >
        {children}
      </body>
    </html>
  );
}
