import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Foliow — Your craft, your audience",
    template: "%s | Foliow",
  },
  description:
    "The professional portfolio platform for UK tradespeople and skilled craftspeople. Own your audience, not your employer.",
  keywords: ["tradespeople", "portfolio", "hairdresser", "tattoo", "carpenter", "UK"],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://foliow.co.uk",
    siteName: "Foliow",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
