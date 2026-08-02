import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "AgriPredict — AI Crop Market Intelligence",
  description: "Real-time crop prices, AI predictions, weather integration, and smart recommendations for farmers across India. Supports English, Tamil, Telugu.",
  keywords: "crop price prediction, agricultural market, mandi prices, kisan, farmer app, AI farming India",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <ClientLayout>{children}</ClientLayout>
        </AppProvider>
      </body>
    </html>
  );
}
