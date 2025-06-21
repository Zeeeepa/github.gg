import type { Metadata } from "next"
import UserProfile from "@/components/user/user-profile"
import { getUserData } from "@/lib/github"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function generateMetadata({ params }: { params: Promise<{ user: string }> }): Promise<Metadata> {
  const { user } = await params
  
  // Don't try to generate metadata for reserved paths
  if (user === "search") {
    return {
      title: "Search - GitHub.GG",
      description: "Search for repositories, users, and issues on GitHub.GG",
    }
  }

  try {
    const userData = await getUserData(user)
    return {
      title: `${userData?.name || user} - GitHub.GG`,
      description: `AI-powered analysis of ${user}'s GitHub profile and repositories`,
    }
  } catch (error) {
    return {
      title: "User Not Found - GitHub.GG",
      description: "The requested user profile could not be found",
    }
  }
}

export default async function UserPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params
  
  // Handle reserved paths - only return notFound for "search" now
  // We're removing "docs" from this check to allow the docs route to work
  if (user === "search") {
    notFound()
    return null
  }

  // Get the user's session if they're logged in
  const session = await getServerSession(authOptions)
  const token = session?.accessToken as string | undefined

  try {
    // Fetch user data with the token if available
    const userData = await getUserData(user, token)

    if (!userData) {
      notFound()
      return null
    }

    return (
      <div className="container py-8">
        <UserProfile username={user} userData={userData} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching user data:", error)
    notFound()
    return null
  }
}
