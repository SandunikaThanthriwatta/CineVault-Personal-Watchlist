import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cinevault",
  description: "Track movies and shows you want to watch",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ minHeight: "100vh" }}>
        <Providers>
          <Navbar />
          <main style={{ paddingTop: 64, minHeight: "100vh" }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
