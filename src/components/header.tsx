"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogIn, LogOut, Search, Star, CodeXml } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  return (
    <header className="bg-neutral-900 text-neutral-200 py-3 px-4 sm:px-6 md:px-8 border-b border-neutral-700">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
          <CodeXml className="h-7 w-7 text-green-400" />
          <span>GitHub.GG</span>
        </Link>

        <div className="flex-1 max-w-md hidden sm:flex items-center relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search repositories..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-500 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <nav className="flex items-center gap-3 sm:gap-4">
          <Link href="/explore" className="text-sm hover:text-green-400 transition-colors hidden md:block">
            Explore
          </Link>
          <Link href="/features" className="text-sm hover:text-green-400 transition-colors hidden md:block">
            Features
          </Link>
          <Link href="/pricing" className="text-sm hover:text-green-400 transition-colors hidden md:block">
            Pricing
          </Link>
          <Link href="/docs" className="text-sm hover:text-green-400 transition-colors hidden md:block">
            Docs
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-200 hover:bg-neutral-700 hover:text-green-400 hidden sm:flex items-center gap-1"
            asChild
          >
            <a href="https://github.com/YOUR_USERNAME/contextweaver" target="_blank" rel="noopener noreferrer">
              {" "}
              {/* TODO: Update with actual repo URL */}
              <Star className="h-4 w-4" />
              Star
              {/* <span className="ml-1 text-xs bg-neutral-700 px-1.5 py-0.5 rounded-sm">7</span> Placeholder for star count */}
            </a>
          </Button>

          {isLoading ? (
            <div className="h-9 w-20 bg-neutral-700 rounded-md animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <Image
                  src={session.user.image || "/placeholder.svg"}
                  alt={session.user.name || "User avatar"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              {/* <span className="text-sm hidden lg:block">{session.user?.name}</span> */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 hover:text-green-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signIn("github")}
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 hover:text-green-400"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </nav>
      </div>
      <div className="mt-3 sm:hidden">
        {" "}
        {/* Search bar for mobile */}
        <div className="flex items-center relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search repositories..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-500 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
    </header>
  )
}
