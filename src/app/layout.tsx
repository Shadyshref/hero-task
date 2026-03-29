import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glyph Workspace",
  description: "Arrange glyphs, save projects, and copy SVG output from one full-stack Next.js app.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
