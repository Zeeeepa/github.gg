import Link from "next/link"

// Trending repositories data matching the target site exactly
const trendingRepos = [
  {
    id: 1,
    name: "vercel/next.js",
    description: "The React Framework for the Web",
    stars: 112500,
    forks: 24800,
    language: "TypeScript",
  },
  {
    id: 2,
    name: "facebook/react",
    description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
    stars: 213000,
    forks: 44200,
    language: "JavaScript",
  },
  {
    id: 3,
    name: "microsoft/vscode",
    description: "Visual Studio Code",
    stars: 149000,
    forks: 26300,
    language: "TypeScript",
  },
  {
    id: 4,
    name: "tailwindlabs/tailwindcss",
    description: "A utility-first CSS framework for rapid UI development.",
    stars: 73400,
    forks: 3900,
    language: "CSS",
  },
  {
    id: 5,
    name: "denoland/deno",
    description: "A modern runtime for JavaScript and TypeScript.",
    stars: 89700,
    forks: 4800,
    language: "Rust",
  },
  {
    id: 6,
    name: "sveltejs/svelte",
    description: "Cybernetically enhanced web apps",
    stars: 71900,
    forks: 3800,
    language: "TypeScript",
  },
]

export default function ExplorePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Trending Repositories</h2>
      
      <div className="space-y-6">
        {trendingRepos.map((repo) => (
          <div key={repo.id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="mb-2">
              <Link 
                href={`/${repo.name}`} 
                className="text-blue-600 hover:underline text-lg font-medium"
              >
                {repo.name}
              </Link>
            </div>
            
            <p className="text-gray-700 mb-3">{repo.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{repo.language}</span>
              <span>{repo.stars.toLocaleString()}</span>
              <span>{repo.forks.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
