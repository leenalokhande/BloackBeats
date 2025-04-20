import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { FaMusic } from "react-icons/fa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BlockBeats | Blockchain Music Licensing",
  description: "Decentralized music licensing platform on Arbitrum blockchain. License music directly from creators with transparent, fair, and instant payments.",
  keywords: "blockchain, music, licensing, NFT, Arbitrum, decentralized, artists, royalties, smart contracts",
  authors: [{ name: "BlockBeats Team" }],
  openGraph: {
    title: "BlockBeats | Blockchain Music Licensing",
    description: "Decentralized music licensing platform on Arbitrum blockchain",
    url: "https://blockbeats.io",
    siteName: "BlockBeats",
    images: [
      {
        url: "/images/blockbeats-og.jpg",
        width: 1200,
        height: 630,
        alt: "BlockBeats Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlockBeats | Blockchain Music Licensing",
    description: "Decentralized music licensing platform on Arbitrum blockchain",
    images: ["/images/blockbeats-twitter.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#9333ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700`}
      >
           <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white overflow-hidden">
        <Navbar/>
        {children}
        <footer className="border-t border-white/10 bg-black/30 backdrop-blur-md py-10 mt-10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <FaMusic className="h-8 w-8 text-pink-400" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">BlockBeats</span>
          </div>
          <p className="text-gray-100 mb-6 max-w-2xl mx-auto">
            BlockBeats is revolutionizing the music industry by creating a decentralized platform for music licensing on the Arbitrum blockchain.
          </p>
    
          <p className="text-sm text-white">
            Decentralized Music Licensing Platform © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
      </div>
      </body>
    </html>
  );
}
