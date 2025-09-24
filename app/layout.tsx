import { Nunito } from "next/font/google";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "minjun.kim",
  icons: {
    shortcut: "/favicon.ico",
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/favicon-16.png",
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: "/favicon-32.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
  },
  verification: {
    other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? {
          "naver-site-verification":
            process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION,
        }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={nunito.variable}>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
