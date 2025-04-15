"use client"

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/hooks/use-toast"

export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}
