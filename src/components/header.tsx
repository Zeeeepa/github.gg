"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { CodeXml, Search, Star, Menu, X, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRepositoryStore } from "@/store/store"

export function Header() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const setCurrentRepositoryUrl = useRepositoryStore((state) => state.setCurrentRepositoryUrl)

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Basic validation: check if it looks like a github.com URL
      // More robust validation can be added later
      if (
        searchQuery.trim().startsWith("github.com/") ||
        searchQuery.trim().match(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/)
      ) {
        let fullUrl = searchQuery.trim()
        if (!fullUrl.startsWith("github.com/")) {
          fullUrl = `github.com/${fullUrl}`
        }
        setCurrentRepositoryUrl(fullUrl)
        setSearchQuery("") // Clear input after submit
      } else {
        // TODO: Show an error message to the user
        console.warn("Invalid GitHub repository URL format")
        alert("Please enter a valid GitHub repository URL (e.g., github.com/owner/repo or owner/repo)")
      }
    }
  }

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/docs", label: "Docs" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-700 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <CodeXml className="h-6 w-6 text-green-400" />
          <span className="font-bold sm:inline-block text-neutral-50">GitHub.GG</span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="relative mr-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search repositories... (e.g., vercel/next.js)"
            className="w-full rounded-lg bg-neutral-800 pl-8 md:w-[200px] lg:w-[336px] text-neutral-50 border-neutral-700 focus:border-green-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <nav className="hidden space-x-2 md:flex md:ml-6">
          {navLinks.map((link) => (
            <Button
              key={link.label}
              variant="ghost"
              asChild
              className="text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-green-400"
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-neutral-300 hover:bg-neutral-800 hover:text-green-400"
          >
            {/* TODO: Update this link to your actual GitHub repo */}
            <Link href="https://github.com/your-org/github.gg" target="_blank" rel="noopener noreferrer">
              <Star className="h-5 w-5" />
              <span className="sr-only">Star on GitHub</span>
            </Link>
          </Button>
          {session ? (
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
              <span className="hidden sm:inline text-sm text-neutral-300">
                {session.user?.name || session.user?.email}
              </span>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="text-sm border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-green-400 hover:border-green-400"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => signIn("github")}
              className="text-sm border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-green-400 hover:border-green-400"
            >
              <Github className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-neutral-300 hover:bg-neutral-800 hover:text-green-400"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-neutral-900 border-neutral-800 text-neutral-50"
            >
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Button
                    key={link.label}
                    variant="ghost"
                    asChild
                    className="justify-start text-lg hover:bg-neutral-800 hover:text-green-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
