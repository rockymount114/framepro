import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AIAssistantWidget } from "@/components/ai/AIAssistantWidget";

export const metadata: Metadata = {
  title: "FramePro | AI-Powered Picture Frame & Interior Visualization Platform",
  description: "Visualize premium PS picture frame mouldings, detect room walls in AI, generate wholesale quotations, and manage container logistics.",
  keywords: "picture frame mouldings, PS moulding, AI room visualizer, wholesale framing, interior design AI, framing quotation"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <AIAssistantWidget />
        <Footer />
      </body>
    </html>
  );
}
