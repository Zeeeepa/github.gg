import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

// Mock trending repositories data
const trendingRepos = [
  {
    id: 1,
    name: "vercel/next.js",
    description: "The React Framework for the Web",
    stars: 112500,
    forks: 24800,
    language: "TypeScript",
    languageColor: "#3178c6",
  },
  {
    id: 2,
    name: "facebook/react",
    description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
    stars: 213000,
    forks: 44200,
    language: "JavaScript",
    languageColor: "#f1e05a",
  },
  {
    id: 3,
    name: "microsoft/vscode",
    description: "Visual Studio Code",
    stars: 149000,
    forks: 26300,
    language: "TypeScript",
    languageColor: "#3178c6",
  },
  {
    id: 4,
    name: "tailwindlabs/tailwindcss",
    description: "A utility-first CSS framework for rapid UI development.",
    stars: 73400,
    forks: 3900,
    language: "CSS",
    languageColor: "#563d7c",
  },
  {
    id: 5,
    name: "denoland/deno",
    description: "A modern runtime for JavaScript and TypeScript.",
    stars: 89700,
    forks: 4800,
    language: "Rust",
    languageColor: "#dea584",
  },
  {
    id: 6,
    name: "sveltejs/svelte",
    description: "Cybernetically enhanced web apps",
    stars: 71900,
    forks: 3800,
    language: "TypeScript",
    languageColor: "#3178c6",
  },
]

// Mock featured topics data
const featuredTopics = [
  { id: 1, name: "react", repos: 1250000, description: "React is a JavaScript library for building user interfaces" },
  {
    id: 2,
    name: "typescript",
    repos: 980000,
    description: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript",
  },
  { id: 3, name: "nextjs", repos: 420000, description: "Next.js is a React framework for production" },
  { id: 4, name: "tailwindcss", repos: 310000, description: "A utility-first CSS framework for rapid UI development" },
  { id: 5, name: "ai", repos: 280000, description: "Artificial intelligence and machine learning projects" },
  { id: 6, name: "web-development", repos: 1800000, description: "Web development frameworks, libraries, and tools" },
]

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Tabs defaultValue="trending" className="mb-8">
          <TabsList className="mb-6 bg-muted/50">
            <TabsTrigger value="trending" className="data-[state=active]:bg-background">Trending</TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:bg-background">Topics</TabsTrigger>
            <TabsTrigger value="collections" className="data-[state=active]:bg-background">Collections</TabsTrigger>
          </TabsList>

          <TabsContent value="trending">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Trending Repositories</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                    Today
                  </Button>
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                    This week
                  </Button>
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                    This month
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {trendingRepos.map((repo) => (
                  <div key={repo.id} className="border border-border rounded-lg p-6 bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link 
                            href={`/${repo.name}`} 
                            className="text-xl font-semibold text-primary hover:underline"
                          >
                            {repo.name}
                          </Link>
                        </div>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {repo.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ backgroundColor: repo.languageColor }}
                            ></span>
                            <span>{repo.language}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                            </svg>
                            <span>{repo.stars.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" />
                              <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            <span>{repo.forks.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-4 border-border hover:bg-muted">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                        Star
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="topics">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Featured Topics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredTopics.map((topic) => (
                  <div key={topic.id} className="border border-border rounded-lg p-6 bg-card hover:bg-muted/50 transition-colors h-full">
                    <div className="space-y-3">
                      <div>
                        <Link href={`/topics/${topic.name}`} className="text-lg font-semibold text-primary hover:underline">
                          #{topic.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{topic.repos.toLocaleString()} repositories</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collections">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Collections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-border rounded-lg overflow-hidden bg-card hover:bg-muted/50 transition-colors">
                  <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl">🤖</div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Machine Learning Tools</h3>
                      <p className="text-sm text-muted-foreground">Essential libraries and frameworks for ML</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">tensorflow</Badge>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">pytorch</Badge>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">scikit-learn</Badge>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">huggingface</Badge>
                    </div>
                    <Button variant="outline" className="w-full border-border hover:bg-muted">
                      View Collection
                    </Button>
                  </div>
                </div>

                <div className="border border-border rounded-lg overflow-hidden bg-card hover:bg-muted/50 transition-colors">
                  <div className="relative h-48 bg-gradient-to-br from-green-500/20 to-blue-500/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl">🌐</div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Modern Web Development</h3>
                      <p className="text-sm text-muted-foreground">Top frameworks for building web applications</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">react</Badge>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">next.js</Badge>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">vue</Badge>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">svelte</Badge>
                    </div>
                    <Button variant="outline" className="w-full border-border hover:bg-muted">
                      View Collection
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
