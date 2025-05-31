import { create } from "zustand"

interface RepositoryState {
  currentRepositoryUrl: string | null
  setCurrentRepositoryUrl: (url: string | null) => void
  // We can add more state related to the repository here later
  // e.g., repositoryDetails, analysisStatus, etc.
}

export const useRepositoryStore = create<RepositoryState>((set) => ({
  currentRepositoryUrl: null, // 'github.com/preactjs/preact' // Initial example
  setCurrentRepositoryUrl: (url) => set({ currentRepositoryUrl: url }),
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
