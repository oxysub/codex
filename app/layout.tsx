import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opal — Oxydata",
  description: "Opal: AI recruiter workspace for Oxydata recruitment operations."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
