import NextAuth, { type NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema/auth-adapter-schema" // We'll create this schema file

if (!process.env.GITHUB_CLIENT_ID) {
  throw new Error("Missing GITHUB_CLIENT_ID environment variable")
}
if (!process.env.GITHUB_CLIENT_SECRET) {
  throw new Error("Missing GITHUB_CLIENT_SECRET environment variable")
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email repo", // Request 'repo' scope for accessing repositories
        },
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for session strategy
  },
  callbacks: {
    async session({ session, token }) {
      // Add githubId and id from token to session object
      if (token) {
        session.user.id = token.sub as string // token.sub is typically the user's ID from the provider or adapter
        // If using DrizzleAdapter, token.sub might be the adapter user ID.
        // We might need to fetch the GitHub ID separately or ensure it's in the token.
        // For now, let's assume token.sub is the user's primary ID in our system.
        // We'll also want to store the GitHub access token if we need to make API calls on behalf of the user.
      }
      if (token && token.accessToken) {
        // @ts-expect-error // session.accessToken is not a default property
        session.accessToken = token.accessToken as string
      }
      if (token && token.githubId) {
        // @ts-expect-error
        session.user.githubId = token.githubId as string
      }

      return session
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and user's GitHub ID to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token
        // The user object here comes from the adapter after it creates/links the user.
        // We need to ensure our adapter's user schema (or the main users schema) has githubId.
        // @ts-expect-error
        token.githubId = user.githubId || (user as any).id // Fallback if githubId isn't directly on user
      }
      if (user) {
        token.sub = user.id // Ensure the JWT sub claim is our internal user ID
      }
      return token
    },
  },
  // pages: { // Optional: Custom pages
  //   signIn: '/auth/signin',
  //   signOut: '/auth/signout',
  //   error: '/auth/error', // Error code passed in query string as ?error=
  //   verifyRequest: '/auth/verify-request', // (e.g. check your email)
  //   newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  // }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
