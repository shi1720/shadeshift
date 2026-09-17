import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShadeShift | Cooler last miles, stronger cities",
  description:
    "Compare heat exposure, intervention costs, and community benefits across World Cup host markets.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
