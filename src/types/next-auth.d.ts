import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string // To store GitHub access token
    user: {
      id: string // Our internal user ID
      githubId?: string // User's GitHub ID
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    // Add custom properties to the User object (from your database)
    // This is the user object returned by the adapter's getUser/createUser methods
    githubId?: string // Ensure our adapter provides this
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string
    githubId?: string
  }
}
