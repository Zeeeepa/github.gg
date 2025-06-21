import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "lucide-react"
import { getRepoData } from "@/lib/github"
import { ActionsClientWrapper } from "./client-wrapper"

export async function generateMetadata({ params }: { params: Promise<{ user: string; repo: string }> }): Promise<Metadata> {
  const { user, repo } = await params
  return {
    title: `Actions · ${user}/${repo} - GitHub.GG`,
    description: `CI/CD workflows and actions for ${user}/${repo}`,
  }
}

export default async function RepoActionsPage({ params }: { params: Promise<{ user: string; repo: string }> }) {
  const { user, repo } = await params
  const repoData = await getRepoData(user, repo)

  return (
    <div className="container py-4">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Actions</h1>
          <div className="flex items-center gap-3">
            <Button>New workflow</Button>
          </div>
        </div>

        <ActionsClientWrapper params={params} />
      </div>
    </div>
  )
}
