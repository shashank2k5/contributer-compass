import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Required for React Flow to render correctly
import "@xyflow/react/dist/style.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Contributor Compass",
  description: "Understand any GitHub repository codebase instantly with visual graphs and AI conversational guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-black text-white min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
