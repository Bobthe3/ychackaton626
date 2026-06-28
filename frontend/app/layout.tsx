import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NeuroViral",
  description: "Stop spraying and praying. Your brain tells you what goes viral.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="flex gap-4 border-b border-neutral-800 px-4 py-2 text-sm">
          <span className="font-bold">NeuroViral 🧠</span>
          <Link href="/live" className="hover:underline">Live</Link>
          <Link href="/log" className="hover:underline">Log</Link>
          <Link href="/report" className="hover:underline">Report</Link>
        </nav>
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
