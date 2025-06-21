import type React from "react"
import { Suspense } from "react"
import RepoHeader from "@/components/repo/repo-header"
import RepoNavigation from "@/components/repo/repo-navigation"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { getRepoData } from "@/lib/github"

export default async function RepoLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ user: string; repo: string }>
}) {
  const { user, repo } = await params
  
  try {
    const repoData = await getRepoData(user, repo)

    return (
      <div className="flex flex-col min-h-screen">
        <RepoHeader username={user} reponame={repo} repoData={repoData} />
        <RepoNavigation username={user} reponame={repo} repoData={repoData} />
        <main className="flex-1 bg-background">
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error fetching repo data for layout:", error)
    return (
      <div className="container py-6">
        <p className="text-red-500">Failed to load repository data. Please try again later.</p>
      </div>
    )
  }
}
