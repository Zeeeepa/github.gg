import type { Metadata } from "next"
import { notFound } from "next/navigation"
import RepoCompare from "@/components/repo/repo-compare"
import { getRepoData, getCompareData } from "@/lib/github"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ user: string; repo: string; refs: string[] }>
}): Promise<Metadata> {
  const { user, repo, refs } = await params
  const compareString = refs.join("...")

  return {
    title: `Comparing ${compareString} · ${user}/${repo} - GitHub.GG`,
    description: `AI-powered analysis of changes between ${compareString} in ${user}/${repo}`,
  }
}

export default async function RepoComparePage({
  params,
}: {
  params: Promise<{ user: string; repo: string; refs: string[] }>
}) {
  const { user, repo, refs } = await params
  
  try {
    const repoData = await getRepoData(user, repo)

    // Handle different compare formats (base...head or base..head)
    let base: string, head: string

    if (refs.length === 1) {
      // Handle the case where it's passed as a single string with ... or .. in it
      const parts = refs[0].split(/\.\.\.|\.\./)
      base = parts[0]
      head = parts[1] || "HEAD"
    } else if (refs.length === 2) {
      base = refs[0]
      head = refs[1]
    } else {
      throw new Error("Invalid compare format")
    }

    const compareData = await getCompareData(user, repo, base, head)

    return (
      <div className="container py-4">
        <RepoCompare
          username={user}
          reponame={repo}
          base={base}
          head={head}
          repoData={repoData}
          compareData={compareData}
        />
      </div>
    )
  } catch (error) {
    console.error("Error fetching compare data:", error)
    notFound()
  }
}
