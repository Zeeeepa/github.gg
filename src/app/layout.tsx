import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"; // Moved to Providers
import { Providers } from "./providers" // Import the new Providers component

const inter = Inter({ subsets: ["latin"] })

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
      <body className={inter.className}>
        <Providers>
          {" "}
          {/* Wrap with Providers */}
          {children}
        </Providers>
      </body>
    </html>
  )
}
