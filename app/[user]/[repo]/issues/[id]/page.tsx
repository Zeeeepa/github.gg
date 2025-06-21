import type { Metadata } from "next"
import { notFound } from "next/navigation"
import RepoIssueDetail from "@/components/repo/repo-issue-detail"
import { getRepoData, getIssueData } from "@/lib/github"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ user: string; repo: string; id: string }>
}): Promise<Metadata> {
  const { user, repo, id } = await params
  
  try {
    const issueData = await getIssueData(user, repo, id)

    return {
      title: `${issueData.title} · Issue #${id} · ${user}/${repo} - GitHub.GG`,
      description: `AI-powered analysis of issue #${id} in ${user}/${repo}`,
    }
  } catch (error) {
    return {
      title: `Issue #${id} · ${user}/${repo} - GitHub.GG`,
      description: `AI-powered analysis of issue #${id} in ${user}/${repo}`,
    }
  }
}

export default async function RepoIssuePage({
  params,
}: {
  params: Promise<{ user: string; repo: string; id: string }>
}) {
  const { user, repo, id } = await params
  
  try {
    const repoData = await getRepoData(user, repo)
    const issueData = await getIssueData(user, repo, id)

    return (
      <div className="container py-4">
        <RepoIssueDetail
          username={user}
          reponame={repo}
          issueId={id}
          repoData={repoData}
          issueData={issueData}
        />
      </div>
    )
  } catch (error) {
    console.error("Error fetching issue data:", error)
    notFound()
  }
}
