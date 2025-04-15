import { Inter } from "next/font/google"
import "./globals.css"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Navbar from "@/components/Navbar"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from "@/components/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Investment Platform",
  description: "A platform for managing investments",
    generator: 'v0.dev'
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto py-6 px-4">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}


import './globals.css'