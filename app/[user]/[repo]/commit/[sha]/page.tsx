import type { Metadata } from "next"
import { notFound } from "next/navigation"
import RepoCommitDetail from "@/components/repo/repo-commit-detail"
import { getRepoData, getCommitData } from "@/lib/github"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ user: string; repo: string; sha: string }>
}): Promise<Metadata> {
  const { user, repo, sha } = await params
  
  try {
    const commitData = await getCommitData(user, repo, sha)

    return {
      title: `${commitData.message.split("\n")[0]} · ${sha.substring(0, 7)} · ${user}/${repo} - GitHub.GG`,
      description: `AI-powered analysis of commit ${sha.substring(0, 7)} in ${user}/${repo}`,
    }
  } catch (error) {
    return {
      title: `Commit ${sha.substring(0, 7)} · ${user}/${repo} - GitHub.GG`,
      description: `AI-powered analysis of commit ${sha.substring(0, 7)} in ${user}/${repo}`,
    }
  }
}

export default async function RepoCommitPage({
  params,
}: {
  params: Promise<{ user: string; repo: string; sha: string }>
}) {
  const { user, repo, sha } = await params
  
  try {
    const repoData = await getRepoData(user, repo)
    const commitData = await getCommitData(user, repo, sha)

    return (
      <div className="container py-4">
        <RepoCommitDetail
          username={user}
          reponame={repo}
          sha={sha}
          repoData={repoData}
          commitData={commitData}
        />
      </div>
    )
  } catch (error) {
    console.error("Error fetching commit data:", error)
    notFound()
  }
}
