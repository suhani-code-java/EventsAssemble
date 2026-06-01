import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "EchoPod — Intelligent Event Registration Platform",
  description: "Discover, register, and manage events with smart recommendations, QR attendance, gamification, and real-time analytics.",
  keywords: ["events", "registration", "hackathon", "QR attendance", "smart recommendations"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-cream-50">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              borderRadius: '12px',
              border: '1px solid #EDE5DB',
            },
          }}
        />
      </body>
    </html>
  );
}
