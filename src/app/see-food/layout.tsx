import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SeeFood",
  description: "The Shazam for Food",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
