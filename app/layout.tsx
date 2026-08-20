import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { PageTransition } from "@/components/ui/PageTransition";
import { RouteLoadingBar } from "@/components/ui/RouteLoadingBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DigitalWorld Industrial | Advanced Fire Suppression Systems",
  description:
    "Premium industrial distributor of Heat Aerosol Fire Extinguishing Devices for electrical panels, server racks, MCB boxes, and critical machinery.",
  keywords: [
    "Fire Suppression",
    "Heat Aerosol",
    "Electrical Panel Fire Protection",
    "Industrial Safety",
    "Aerosol Extinguisher",
  ],
};

export const viewport: Viewport = {
  themeColor: "#121413",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark scroll-smooth", inter.variable, jetbrainsMono.variable)}>
      <head>
        {/* Material Symbols / Google Fonts loaded via CSS */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background text-on-surface font-body-md antialiased selection:bg-primary-container selection:text-white"
        )}
      >
        <Providers>
          <CustomCursor />
          <RouteLoadingBar />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
          <FloatingWhatsApp />
        </Providers>
      </body>
    </html>
  );
}
