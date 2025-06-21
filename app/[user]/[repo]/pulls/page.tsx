import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitPullRequestIcon, MessageCircleIcon, ClockIcon } from "lucide-react"
import { getRepoData } from "@/lib/github"
import { PullsClientWrapper } from "./client-wrapper"

export async function generateMetadata({ params }: { params: Promise<{ user: string; repo: string }> }): Promise<Metadata> {
  const { user, repo } = await params
  return {
    title: `Pull Requests · ${user}/${repo} - GitHub.GG`,
    description: `AI-powered analysis of pull requests in ${user}/${repo}`,
  }
}

export default async function RepoPullsPage({
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

  return (
    <div className="container py-4">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Pull Requests</h1>
          <div className="flex items-center gap-3">
            <Button>New Pull Request</Button>
          </div>
        </div>

        <PullsClientWrapper params={{ user, repo }} searchParams={{ page, state }} />
      </div>
    </div>
  )
}
