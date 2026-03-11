import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "./providers";

export const metadata: Metadata = {
  title: "GreenLens – Sustainable Shopping Rewards",
  description: "Earn Green Tokens for every eco-friendly purchase. Track your sustainability impact.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface-900 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
