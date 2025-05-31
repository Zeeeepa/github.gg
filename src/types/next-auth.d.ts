import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string | null
    user: {
      id: string // Your internal user ID
      githubId?: string | null // GitHub's user ID
    } & DefaultSession["user"] // Extends default user properties (name, email, image)
  }

  interface User extends DefaultUser {
    // DefaultUser already has id, name, email, image
    // If your adapter returns githubId directly on the user object, you can add it here.
    // However, we are primarily sourcing it from account.providerAccountId in the jwt callback.
    githubId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | null
    githubId?: string | null
    userId?: string | null // Your internal user ID
  }
}
