"use client"

import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/context/Authcontext"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()

  useEffect(() => {
    if (auth?.user||auth?.isLoggedIn) {
      router.push("/dashboard")
    }
  }, [auth?.isLoggedIn, router])

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Image
            src="/images.png?height=60&width=60"
            alt="DMS Logo"
            width={60}
            height={60}
            className="rounded-md"
          />
          <h1 className="text-2xl font-bold">Document Management System</h1>
          <p className="text-sm text-muted-foreground">Sign in to access documents</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

