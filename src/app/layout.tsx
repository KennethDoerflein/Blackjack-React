import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

export const metadata: Metadata = {
  title: "Blackjack",
  description: "A simple Blackjack game built with React and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-bs-theme="dark" suppressHydrationWarning>
      <link rel="icon" href="/assets/cards-1.3/red_joker.png" />
      <body>{children}</body>
    </html>
  );
}
