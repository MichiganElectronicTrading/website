import type { Metadata } from "next";
import { Red_Hat_Display, Red_Hat_Mono, Red_Hat_Text } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal, { revealBootScript } from "@/components/Reveal";
import { site } from "@/data/site";
import "./globals.css";

const display = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-red-hat-display",
});
const text = Red_Hat_Text({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-red-hat-text",
});
const mono = Red_Hat_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-red-hat-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.michiganelectronictrading.com"),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.tagline,
  // Proves ownership to Google Search Console.
  verification: { google: "YVNv1BCW_PKx0ZVXRB4F0sljVItKhDZ2bOJM3X6w76U" },
  // Served from public/ so the URLs never change; Google wants a stable favicon URL.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The boot script adds a class to <html> before React hydrates.
    <html
      lang="en"
      className={`${display.variable} ${text.variable} ${mono.variable}`}
      // Lets Next.js turn smooth scrolling off during page changes.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealBootScript }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Reveal />
      </body>
    </html>
  );
}
