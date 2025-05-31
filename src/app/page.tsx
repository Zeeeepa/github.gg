"use client"
import Image from "next/image"
import { useRepositoryStore, type RepositoryDetails } from "@/store/store" // Adjusted path
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Star, GitFork, AlertCircle, ExternalLink, Code, FileText, Users } from "lucide-react"

function RepositoryInfoCard({ details }: { details: RepositoryDetails }) {
  return (
    <Card className="w-full max-w-2xl bg-neutral-850 border-neutral-700 text-neutral-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-green-400">{details.fullName}</CardTitle>
          <a
            href={details.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-green-400 transition-colors"
            aria-label="View on GitHub"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
        {details.owner && (
          <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
            <Image
              src={details.owner.avatarUrl || "/placeholder.svg"}
              alt={details.owner.login}
              width={20}
              height={20}
              className="rounded-full"
            />
            <a href={details.owner.htmlUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {details.owner.login}
            </a>
          </div>
        )}
        {details.description && (
          <CardDescription className="text-neutral-300 pt-2">{details.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span>{details.stars.toLocaleString()} stars</span>
        </div>
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-blue-400" />
          <span>{details.forks.toLocaleString()} forks</span>
        </div>
        {details.language && (
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-purple-400" />
            <span>{details.language}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-orange-400" />
          <span>Default Branch: {details.defaultBranch}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-red-400" />
          <span>Visibility: {details.visibility}</span>
        </div>
        {details.license && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span>License: {details.license}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-neutral-500">
        <p>Last pushed: {new Date(details.pushedAt).toLocaleDateString()}</p>
      </CardFooter>
    </Card>
  )
}

export default function Home() {
  const {
    currentRepositoryUrl,
    setCurrentRepositoryUrl,
    repositoryDetails,
    isLoadingDetails,
    errorDetails,
    clearRepositoryDetails,
  } = useRepositoryStore()

  // The logic to fetch details is now part of setCurrentRepositoryUrl in the store
  // So, no useEffect needed here specifically for fetching when currentRepositoryUrl changes.

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100 font-[family-name:var(--font-geist-sans)]">
      {/* Header is now part of the global layout, so not rendered here directly */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl text-center mb-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="text-green-400">Context</span>Weaver
          </h1>
          <p className="text-lg text-neutral-400 mb-8">Instantly understand and interact with any GitHub repository.</p>
          {/* Search input is in the Header component */}
        </div>

        {isLoadingDetails && (
          <div className="flex items-center justify-center space-x-2 text-lg mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            <span>Loading repository details...</span>
          </div>
        )}

        {errorDetails && !isLoadingDetails && (
          <Alert variant="destructive" className="w-full max-w-md mt-8 bg-red-900/30 border-red-700 text-red-200">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <AlertTitle>Error Fetching Repository</AlertTitle>
            <AlertDescription>{errorDetails}</AlertDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={clearRepositoryDetails}
              className="mt-4 border-red-600 hover:bg-red-800/50"
            >
              Clear
            </Button>
          </Alert>
        )}

        {!isLoadingDetails && !errorDetails && repositoryDetails && (
          <div className="mt-8 w-full flex justify-center">
            <RepositoryInfoCard details={repositoryDetails} />
          </div>
        )}

        {!isLoadingDetails && !errorDetails && !repositoryDetails && currentRepositoryUrl && (
          <p className="mt-8 text-neutral-400">
            No details to display for {currentRepositoryUrl}. It might be an invalid URL or the repository doesn't
            exist.
          </p>
        )}

        {!currentRepositoryUrl && !isLoadingDetails && !errorDetails && (
          <div className="text-center mt-12">
            <p className="text-xl text-neutral-300 mb-4">
              Enter a GitHub repository URL in the search bar above to get started.
            </p>
            <p className="text-neutral-500 text-sm">
              (e.g., <code className="bg-neutral-700 px-1 rounded">vercel/next.js</code> or{" "}
              <code className="bg-neutral-700 px-1 rounded">github.com/facebook/react</code>)
            </p>
            <Button
              onClick={() => setCurrentRepositoryUrl("github.com/vercel/next.js")}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Load Example: Vercel/Next.js
            </Button>
          </div>
        )}

        {/* Placeholder for where the main content (AI Summaries, Code Exploration tabs) will go */}
        {repositoryDetails && (
          <div className="w-full max-w-4xl mt-12">
            {/* TODO: Implement Tabs for AI Summaries, Code Exploration, GitHub Integration will go here */}
            <p className="text-center text-2xl p-8 bg-neutral-850 rounded-lg border border-neutral-700">
              [Tabs for AI Summaries, Code Exploration, GitHub Integration will go here]
            </p>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-sm text-neutral-500 border-t border-neutral-800">
        © {new Date().getFullYear()} ContextWeaver by GitHub.GG. All rights reserved.
      </footer>
    </div>
  )
}
