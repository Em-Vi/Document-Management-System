"use client"

import type React from "react"

import { Header } from "@/components/header"
import { UserDrawer } from "@/components/user-drawer"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/Authcontext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const auth = useAuth()

  useEffect(() => {
    setIsClient(true)

    // Check if user is logged in, but only redirect if auth is not still loading
    if (!auth?.isLoading && !auth?.isLoggedIn) {
      console.log("No authenticated user found, redirecting to login");
      router.push("/")
    }
  }, [auth?.isLoading, auth?.isLoggedIn, router])

  if (!isClient) {
    return null // Prevent hydration errors
  }
  
  // Show loading while auth state is being determined
  if (auth?.isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  // Only render the dashboard if the user is logged in
  if (!auth?.isLoggedIn) {
    return null // This prevents a flash of the dashboard before redirect
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onAvatarClick={() => setIsDrawerOpen(true)} />
      <UserDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
    </div>
  )
}

