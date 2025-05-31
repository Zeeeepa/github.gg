import { create } from "zustand"

// Define a type for the repository details we expect from our API
export interface RepositoryDetails {
  id: number
  fullName: string
  name: string
  owner: {
    login: string
    avatarUrl: string
    htmlUrl: string
  }
  description: string | null
  htmlUrl: string
  stars: number
  forks: number
  openIssues: number
  language: string | null
  defaultBranch: string
  createdAt: string
  updatedAt: string
  pushedAt: string
  visibility: string
  isPrivate: boolean
  isFork: boolean
  topics: string[]
  license: string | null
}

interface RepositoryState {
  currentRepositoryUrl: string | null
  setCurrentRepositoryUrl: (url: string | null) => void
  repositoryDetails: RepositoryDetails | null
  isLoadingDetails: boolean
  errorDetails: string | null
  fetchRepositoryDetails: (repoFullName: string) => Promise<void>
  clearRepositoryDetails: () => void
}

export const useRepositoryStore = create<RepositoryState>((set, get) => ({
  currentRepositoryUrl: null,
  repositoryDetails: null,
  isLoadingDetails: false,
  errorDetails: null,

  setCurrentRepositoryUrl: (url) => {
    set({
      currentRepositoryUrl: url,
      repositoryDetails: null, // Clear previous details when URL changes
      isLoadingDetails: false,
      errorDetails: null,
    })
    if (url) {
      // Extract owner/repo from the full URL or short form
      let repoFullName = url
      if (url.startsWith("github.com/")) {
        repoFullName = url.substring("github.com/".length)
      }
      if (repoFullName.includes("/") && repoFullName.split("/").length === 2) {
        get().fetchRepositoryDetails(repoFullName)
      } else {
        set({
          errorDetails: "Invalid repository URL format. Use owner/repo or github.com/owner/repo.",
          isLoadingDetails: false,
        })
      }
    }
  },

  fetchRepositoryDetails: async (repoFullName: string) => {
    if (!repoFullName || !repoFullName.includes("/")) {
      set({ errorDetails: "Invalid repository name for fetching.", isLoadingDetails: false })
      return
    }
    set({ isLoadingDetails: true, errorDetails: null, repositoryDetails: null })
    try {
      const response = await fetch(`/api/repository/details?repo=${encodeURIComponent(repoFullName)}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch repository details: ${response.statusText}`)
      }
      const data: RepositoryDetails = await response.json()
      set({ repositoryDetails: data, isLoadingDetails: false })
    } catch (error) {
      console.error("Error fetching repository details:", error)
      set({ errorDetails: error instanceof Error ? error.message : String(error), isLoadingDetails: false })
    }
  },
  clearRepositoryDetails: () => {
    set({ repositoryDetails: null, isLoadingDetails: false, errorDetails: null, currentRepositoryUrl: null })
  },
}))

// Example of how other stores could be structured:
// interface UiState {
//   isSidebarOpen: boolean;
//   toggleSidebar: () => void;
// }

// export const useUiStore = create<UiState>((set) => ({
//   isSidebarOpen: true,
//   toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
// }));

// Interface for the chat state
// interface ChatState {
//   messages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>;
//   addMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
//   // ... other chat-related state and actions
// }

// export const useChatStore = create<ChatState>((set) => ({
//   messages: [],
//   addMessage: (message) =>
//     set((state) => ({
//       messages: [...state.messages, { ...message, id: Date.now().toString() }],
//     })),
// }));
