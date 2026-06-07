import type { Metadata } from "next";
import "./globals.css";
import GoogleTranslate from "@/components/GoogleTranslate";

export const metadata: Metadata = {
  title: "MahaDrishti",
  description: "Real-time AI crowd flow prediction, route optimization and safety intelligence for MahaKumbh 2028, Prayagraj",
  keywords: "mahakumbh 2028, crowd management, prayagraj, ai, route optimization, MahaDrishti, mahakumbh",
  icons: {
    icon: "/thirdd_eye.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Yatra+One&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {children}
        <GoogleTranslate />
      </body>
    </html>
  );
}