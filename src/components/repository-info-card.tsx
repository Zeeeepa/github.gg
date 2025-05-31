import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, AlertCircle, Eye, Scale, ExternalLink, Code2, CalendarDays } from "lucide-react"
import type { RepositoryDetails } from "@/store/store" // Assuming RepositoryDetails type is exported from store

interface RepositoryInfoCardProps {
  details: RepositoryDetails
}

function formatCount(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

function timeAgo(dateString: string | null): string {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)
  const months = Math.round(days / 30.44) // Average days in month
  const years = Math.round(days / 365.25) // Account for leap years

  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  if (months < 12) return `${months}mo ago`
  return `${years}y ago`
}

export function RepositoryInfoCard({ details }: RepositoryInfoCardProps) {
  if (!details) return null

  return (
    <Card className="w-full max-w-2xl bg-neutral-850 border-neutral-700 text-neutral-100">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <Avatar className="h-12 w-12 border-2 border-neutral-600">
          <AvatarImage src={details.owner.avatarUrl || "/placeholder.svg"} alt={`${details.owner.login}'s avatar`} />
          <AvatarFallback>{details.owner.login.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-green-400 hover:underline">
              <a href={details.htmlUrl} target="_blank" rel="noopener noreferrer">
                {details.fullName}
              </a>
            </CardTitle>
            <a
              href={details.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-green-400"
              aria-label="View on GitHub"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
          {details.description && (
            <CardDescription className="mt-1 text-neutral-300 text-sm">{details.description}</CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span>{formatCount(details.stars)} Stars</span>
        </div>
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-blue-400" />
          <span>{formatCount(details.forks)} Forks</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-400" />
          <span>{formatCount(details.openIssues)} Open Issues</span>
        </div>
        {details.language && (
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-purple-400" />
            <span>{details.language}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-neutral-400" />
          <span className="capitalize">{details.visibility}</span>
        </div>
        {details.license && (
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-gray-400" />
            <span>{details.license}</span>
          </div>
        )}
        <div className="flex items-center gap-2 col-span-full sm:col-span-1">
          <CalendarDays className="h-4 w-4 text-teal-400" />
          <span>Last push: {timeAgo(details.pushedAt)}</span>
        </div>
      </CardContent>
      {details.topics && details.topics.length > 0 && (
        <div className="p-4 border-t border-neutral-700">
          <h4 className="mb-2 text-xs font-semibold uppercase text-neutral-400">Topics</h4>
          <div className="flex flex-wrap gap-2">
            {details.topics.map((topic) => (
              <Badge key={topic} variant="secondary" className="bg-neutral-700 text-neutral-200 hover:bg-neutral-600">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
