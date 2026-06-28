import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NeuroViral",
  description: "Stop spraying and praying. Your brain tells you what goes viral.",
};

const tabs = [
  { href: "/live", label: "Live" },
  { href: "/log", label: "Log" },
  { href: "/report", label: "Report" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="flex items-center gap-6 border-b border-neutral-800/80 px-6 py-3 text-sm">
          <span className="font-bold tracking-tight">NeuroViral <span className="text-green-400">🧠</span></span>
          <div className="flex gap-4 text-neutral-400">
            {tabs.map((t) => (
              <Link key={t.href} href={t.href} className="hover:text-neutral-100 transition-colors">
                {t.label}
              </Link>
            ))}
          </div>
          <span className="ml-auto text-xs text-neutral-600">Tech UGC · demo</span>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
