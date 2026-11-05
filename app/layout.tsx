import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import { type ReactNode } from "react";

import { QueryProvider } from "@/components/layout";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const APP_NAME = "Dosserai";
const APP_DESCRIPTION =
  "Personal AI knowledge base. Upload, extract, and query in natural language — originals are never stored.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "Dosserai — Ask your documents anything",
    template: "%s · Dosserai",
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="/safe-area.css" />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground selection:bg-brand/15 selection:text-foreground">
        <SerwistProvider swUrl="/serwist/sw.js" cacheOnNavigation={false}>
          <QueryProvider>{children}</QueryProvider>
        </SerwistProvider>
      </body>
    </html>
  );
};

export default RootLayout;
