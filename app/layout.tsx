import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { HealthProvider } from "@/contexts/HealthContext";
import { SystemProvider } from "@/contexts/SystemContext";
import { SettingsPanel } from "@/components/SettingsPanel";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Homelab Dashboard",
  description: "Central command for local services",
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
              <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8">
                {children}
              </main>
              <SettingsPanel />
            </SystemProvider>
          </HealthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
