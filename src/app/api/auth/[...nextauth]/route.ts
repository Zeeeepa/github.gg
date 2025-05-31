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
      // token contains properties we added in the jwt callback
      if (token.userId && session.user) {
        session.user.id = token.userId as string
      }
      if (token.githubId && session.user) {
        // @ts-expect-error // Add githubId to session user if not already defined
        session.user.githubId = token.githubId as string
      }
      if (token.accessToken) {
        // @ts-expect-error // Add accessToken to session if not already defined
        session.accessToken = token.accessToken as string
      }
      return session
    },
    async jwt({ token, user, account }) {
      // user and account are only passed on initial sign-in
      if (account && user) {
        token.accessToken = account.access_token
        token.githubId = account.providerAccountId // This is the GitHub user ID (string)
        token.userId = user.id // This is your internal database user ID from the adapter
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
