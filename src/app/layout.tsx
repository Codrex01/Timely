import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Smart Campus AI — Actionable Notice & Task Intelligence",
  description: "Converts unstructured college circulars, emails, and notices into personalized, actionable, prioritized student tasks using Groq LLMs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-[#f8fafc] antialiased selection:bg-[#2563eb] selection:text-white">
        {children}
      </body>
    </html>
  );
}
