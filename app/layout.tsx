import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { Chatbot } from "@/components/chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Track Moneyku - Virtual Financial Consultant",
  description:
    "Your personal AI-powered expense tracker and financial advisor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased relative",
          geistSans.variable,
          geistMono.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background Blobs for Glassmorphism Effect */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-lighten filter blur-2xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-lighten filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-lighten filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>

          <main className="relative z-10">{children}</main>
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
