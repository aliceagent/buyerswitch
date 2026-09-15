import type { Metadata } from "next";
import { Montserrat, Spectral } from "next/font/google";
import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "BuyerSwitch",
  description:
    "See where competitors win on the things buyers talk about. Interactive concept with synthetic audio-category data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} ${spectral.variable} h-full`}>
      <body className="min-h-full">
        <NuqsAdapter>
          <TooltipProvider>
            <Suspense fallback={<div className="p-8 text-ink-muted">Loading…</div>}>
              <Providers>{children}</Providers>
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
