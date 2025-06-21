import type { Metadata } from "next"
import RepoIssuesList from "@/components/repo/repo-issues-list"
import { getRepoData, getRepoIssues } from "@/lib/github"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ user: string; repo: string }>
}): Promise<Metadata> {
  const { user, repo } = await params
  return {
    title: `Issues · ${user}/${repo} - GitHub.GG`,
    description: `AI-powered analysis of issues in ${user}/${repo}`,
  }
}

export default async function RepoIssuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ user: string; repo: string }>
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { user, repo } = await params
  const repoData = await getRepoData(user, repo)
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const state = typeof searchParams.state === "string" ? searchParams.state : "open"

  const issuesData = await getRepoIssues(user, repo, {
    page,
    state: state as "open" | "closed" | "all",
  })

  return (
    <div className="container py-4">
      <RepoIssuesList
        username={user}
        reponame={repo}
        repoData={repoData}
        issuesData={issuesData}
        currentPage={page}
        currentState={state as "open" | "closed" | "all"}
      />
    </div>
  )
}
