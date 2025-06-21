import type { Metadata } from "next"
import { getRepoData } from "@/lib/github"
import RepoInsightsClientPage from "./client-page"
import type { RepoInsightsData } from "@/lib/types/insights"

export async function generateMetadata({ params }: { params: Promise<{ user: string; repo: string }> }): Promise<Metadata> {
  const { user, repo } = await params
  return {
    title: `Insights · ${user}/${repo} - GitHub.GG`,
    description: `Analytics and insights for ${user}/${repo}`,
  }
}

// This is a mock function that will be replaced with real API calls
async function fetchInsightsData(user: string, repo: string): Promise<RepoInsightsData> {
  // TODO: Replace with real API calls to fetch insights data
  // For now, we'll return mock data
  return {
    contributorsData: [
      { name: "Jan", contributions: 45 },
      { name: "Feb", contributions: 32 },
      { name: "Mar", contributions: 67 },
      { name: "Apr", contributions: 89 },
      { name: "May", contributions: 54 },
      { name: "Jun", contributions: 78 },
      { name: "Jul", contributions: 92 },
      { name: "Aug", contributions: 63 },
      { name: "Sep", contributions: 71 },
      { name: "Oct", contributions: 84 },
      { name: "Nov", contributions: 52 },
      { name: "Dec", contributions: 33 },
    ],
    commitsData: [
      { name: "Jan", commits: 120 },
      { name: "Feb", commits: 98 },
      { name: "Mar", commits: 143 },
      { name: "Apr", commits: 165 },
      { name: "May", commits: 127 },
      { name: "Jun", commits: 150 },
      { name: "Jul", commits: 180 },
      { name: "Aug", commits: 134 },
      { name: "Sep", commits: 162 },
      { name: "Oct", commits: 187 },
      { name: "Nov", commits: 110 },
      { name: "Dec", commits: 85 },
    ],
    topContributors: [
      { name: "developer1", commits: 342, additions: 15420, deletions: 8753 },
      { name: "developer2", commits: 217, additions: 9876, deletions: 5432 },
      { name: "developer3", commits: 184, additions: 7654, deletions: 3210 },
      { name: "developer4", commits: 156, additions: 6543, deletions: 2987 },
      { name: "developer5", commits: 123, additions: 5432, deletions: 1876 },
    ],
    pulseData: {
      activePullRequests: 7,
      activeIssues: 12,
      mergedPullRequests: 23,
      closedIssues: 18,
    },
  };
}

export default async function RepoInsightsPage({ params }: { params: Promise<{ user: string; repo: string }> }) {
  const { user, repo } = await params
  
  // Fetch repository data and insights in parallel
  const [repoData, insightsData] = await Promise.all([
    getRepoData(user, repo),
    fetchInsightsData(user, repo),
  ]);

  // Pass the data to the client component
  return (
    <RepoInsightsClientPage
      params={{ user, repo }}
      contributorsData={insightsData.contributorsData}
      commitsData={insightsData.commitsData}
      topContributors={insightsData.topContributors}
      pulseData={insightsData.pulseData}
    />
  );
}
