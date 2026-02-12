import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { HealthProvider } from "@/contexts/HealthContext";
import { SystemProvider } from "@/contexts/SystemContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexLab",
  description: "Central dashboard for homelab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col`}>
        <SettingsProvider>
          <HealthProvider>
            <SystemProvider>
              {/* AppShell inside page.tsx takes over the layout structure */}
              {children}
            </SystemProvider>
          </HealthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
