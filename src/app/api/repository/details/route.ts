import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // Adjusted path

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated or no access token found" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const repoFullName = searchParams.get("repo") // e.g., "owner/repo-name"

  if (!repoFullName || !repoFullName.includes("/")) {
    return NextResponse.json({ error: "Repository full name (e.g., owner/repo) is required" }, { status: 400 })
  }

  const [owner, repo] = repoFullName.split("/")
  if (!owner || !repo) {
    return NextResponse.json({ error: "Invalid repository full name format" }, { status: 400 })
  }

  const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}`

  try {
    const response = await fetch(githubApiUrl, {
      headers: {
        Authorization: `token ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) // Try to parse error, default to empty object
      console.error(`GitHub API error for ${repoFullName}: ${response.status}`, errorData)
      return NextResponse.json(
        {
          error: `Failed to fetch repository details from GitHub: ${response.statusText}`,
          details: errorData,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Extract relevant details
    const repositoryDetails = {
      id: data.id,
      fullName: data.full_name,
      name: data.name,
      owner: {
        login: data.owner.login,
        avatarUrl: data.owner.avatar_url,
        htmlUrl: data.owner.html_url,
      },
      description: data.description,
      htmlUrl: data.html_url,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      language: data.language,
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
      visibility: data.visibility,
      isPrivate: data.private,
      isFork: data.fork,
      topics: data.topics,
      license: data.license ? data.license.name : null,
    }

    return NextResponse.json(repositoryDetails)
  } catch (error) {
    console.error(`Error fetching repository details for ${repoFullName}:`, error)
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching repository details" },
      { status: 500 },
    )
  }
}
