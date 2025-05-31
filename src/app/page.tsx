"use client" // For Tabs and potential client-side interactions

import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle } from "lucide-react"
import Image from "next/image" // Keep for placeholder or future images

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 flex flex-col items-center">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-100 mb-4">
            github.com/<span className="text-green-400">preactjs/preact</span>
            {/* Placeholder, this will be dynamic */}
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto">
            Instantly understand and interact with any GitHub repository.
          </p>
        </div>

        <Tabs defaultValue="ai-summaries" className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-3 bg-neutral-800 p-1 rounded-lg mb-8">
            <TabsTrigger
              value="ai-summaries"
              className="data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100 text-neutral-400 hover:text-neutral-100"
            >
              AI Summaries
            </TabsTrigger>
            <TabsTrigger
              value="code-exploration"
              className="data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100 text-neutral-400 hover:text-neutral-100"
            >
              Code Exploration
            </TabsTrigger>
            <TabsTrigger
              value="github-integration"
              className="data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100 text-neutral-400 hover:text-neutral-100"
            >
              GitHub Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-summaries">
            <div className="bg-neutral-850 p-6 sm:p-8 rounded-lg shadow-xl grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-100 mb-4">Instant AI Summaries</h2>
                <p className="text-neutral-400 mb-6">
                  Get immediate AI-generated summaries of repositories, files, and code sections to quickly understand
                  their purpose and functionality.
                </p>
                <ul className="space-y-3 text-neutral-300">
                  {[
                    "Repository overviews",
                    "File purpose explanations",
                    "Function descriptions",
                    "Complex logic simplified",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-neutral-700/50 aspect-video rounded-md flex items-center justify-center">
                {/* Placeholder for image/visual */}
                <Image
                  src="/placeholder.svg?height=300&width=400"
                  alt="AI Code Analysis Visualization Placeholder"
                  width={400}
                  height={300}
                  className="opacity-30"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code-exploration">
            <div className="bg-neutral-850 p-6 sm:p-8 rounded-lg shadow-xl text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-100 mb-4">Code Exploration</h2>
              <p className="text-neutral-400">Dive deep into the codebase with interactive tools. (Content TBD)</p>
            </div>
          </TabsContent>

          <TabsContent value="github-integration">
            <div className="bg-neutral-850 p-6 sm:p-8 rounded-lg shadow-xl text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-100 mb-4">GitHub Integration</h2>
              <p className="text-neutral-400">Seamlessly connect with your GitHub workflow. (Content TBD)</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="text-center py-8 text-neutral-500 border-t border-neutral-800">
        © {new Date().getFullYear()} ContextWeaver by GitHub.GG - All rights reserved.
      </footer>
    </div>
  )
}
