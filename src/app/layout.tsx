// No changes needed here, the import should now resolve.
// import { Providers } from "./providers"; // This line was correct.
import type React from "react"
import type { Metadata } from "next"
import { Geist as Geist_Sans, Geist_Mono } from "next/font/google" // Corrected import
import "./globals.css"
import { Providers } from "./providers"

const geistSans = Geist_Sans({
  // Corrected variable name
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ContextWeaver",
  description: "Understand and act upon any GitHub repository.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} // Corrected font variable names
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
