import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NeuroViral",
  description: "Stop spraying and praying. Your brain tells you what goes viral.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
