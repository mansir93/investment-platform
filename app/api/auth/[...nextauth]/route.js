import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await dbConnect()

          // Find user by email
          const user = await User.findOne({ email: credentials.email }).select("+password")

          if (!user) {
            throw new Error("Invalid credentials")
          }

          // Check if password matches
          const isMatch = await user.matchPassword(credentials.password)

          if (!isMatch) {
            throw new Error("Invalid credentials")
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect()

        if (account.provider === "google") {
          const existingUser = await User.findOne({ email: user.email })

          if (existingUser) {
            // Check if Google auth is enabled for this user
            if (!existingUser.isGoogleAuthEnabled) {
              return false
            }

            // Update Google ID if not already set
            if (!existingUser.googleId) {
              existingUser.googleId = user.id
              await existingUser.save()
            }

            return true
          } else {
            // Don't auto-create users - admin must create them first
            return false
          }
        }

        return true
      } catch (error) {
        console.error("Sign in callback error:", error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
