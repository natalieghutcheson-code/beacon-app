import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Beacon — Your signal to the right funding",
  description:
    "Beacon helps governments, nonprofits, and universities find and win the right grants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-cream min-h-screen text-charcoal antialiased">
        <Navigation />
        <main className="min-h-0">{children}</main>
      </body>
    </html>
  );
}
