"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Code2Icon, SearchIcon, MenuIcon, XIcon, GithubIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchResults } from "@/components/search/search-results"
import { GitHubStarButton } from "@/components/github-star-button"
import type { SearchResult } from "@/lib/types/search"
import { useSession } from "next-auth/react"
import { LoginButton } from "@/components/auth/login-button"
import { UserAvatar } from "@/components/auth/user-avatar"
import { cn } from "@/lib/utils"

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Reset search when pathname changes
  useEffect(() => {
    setSearchQuery("")
    setShowResults(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowResults(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim()) {
      setIsSearching(true)
      setShowResults(true)

      // Debounce search
      const timeoutId = setTimeout(() => {
        const results: SearchResult[] = [{
          id: "1",
          type: "repository",
          title: "test",
          description: "test",
          url: "test",
          owner: "test",
          avatar: "test",
          stars: 1,
          language: "test",
          updated: "test",
          matchingText: "test"
        }] 
        setSearchResults(results)
        setIsSearching(false)
      }, 300)

      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowResults(true)
    }
  }

  const closeSearchResults = () => {
    setShowResults(false)
  }

  // Handle smooth scrolling for section links
  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    // Only handle smooth scrolling on the homepage
    if (pathname === "/") {
      e.preventDefault()
      const section = document.getElementById(sectionId)
      if (section) {
        section.scrollIntoView({ behavior: "smooth" })
        setIsMenuOpen(false)
      }
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Code2Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold hidden md:inline-block">GitHub.GG</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center">
          <div ref={searchRef} className="relative w-full max-w-md mr-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search repositories..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                />
              </div>
            </form>

            {showResults && (
              <SearchResults
                results={searchResults}
                query={searchQuery}
                isLoading={isSearching}
                onResultClick={closeSearchResults}
              />
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/explore"
            className={`text-sm font-medium ${
              pathname === "/explore" ? "text-foreground" : "text-muted-foreground"
            } hover:text-foreground transition-colors`}
          >
            Explore
          </Link>
          <Link
            href={pathname === "/" ? "#features" : "/#features"}
            className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors`}
            onClick={(e) => handleSectionClick(e, "features")}
          >
            Features
          </Link>
          <Link
            href={pathname === "/" ? "#pricing" : "/#pricing"}
            className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors`}
            onClick={(e) => handleSectionClick(e, "pricing")}
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className={`text-sm font-medium ${
              pathname === "/docs" ? "text-foreground" : "text-muted-foreground"
            } hover:text-foreground transition-colors`}
          >
            Docs
          </Link>

          {/* GitHub Star Button */}
          <GitHubStarButton owner="lantos1618" repo="github.gg" />
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <AuthButtons />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="container flex flex-col space-y-4">
              <Link
                href="/explore"
                className={`text-sm font-medium ${
                  pathname === "/explore" ? "text-foreground" : "text-muted-foreground"
                } hover:text-foreground transition-colors py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href={pathname === "/" ? "#features" : "/#features"}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={(e) => handleSectionClick(e, "features")}
              >
                Features
              </Link>
              <Link
                href={pathname === "/" ? "#pricing" : "/#pricing"}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={(e) => handleSectionClick(e, "pricing")}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className={`text-sm font-medium ${
                  pathname === "/docs" ? "text-foreground" : "text-muted-foreground"
                } hover:text-foreground transition-colors py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                Docs
              </Link>

              {/* Mobile GitHub Star Button */}
              <GitHubStarButton owner="lantos1618" repo="github.gg" className="py-2" />

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-3 pt-2">
                <div className="md:hidden">
                  <AuthButtons />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

interface AuthButtonsProps {
  className?: string;
}

function AuthButtons({ className }: AuthButtonsProps) {
  const { data: session, status } = useSession()
  
  if (status === 'loading') {
    return (
      <div 
        className={cn(
          "w-24 h-9 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden",
          className
        )}
      >
        <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      </div>
    )
  }

  if (status === 'authenticated' && session) {
    return <UserAvatar className={className} />
  }

  // If unauthenticated or error state
  return <LoginButton className={className} />
}
