"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An error occurred during authentication"

  if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password"
  } else if (error === "OAuthAccountNotLinked") {
    errorMessage = "This email is already associated with another account"
  } else if (error === "OAuthSignin") {
    errorMessage = "Error signing in with OAuth provider"
  } else if (error === "AccessDenied") {
    errorMessage = "You do not have permission to sign in"
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Authentication Error</h1>

        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{errorMessage}</div>

        <div className="text-center">
          <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-800">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
