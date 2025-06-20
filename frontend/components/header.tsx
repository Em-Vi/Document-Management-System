"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/Authcontext"

interface HeaderProps {
  onAvatarClick: () => void
}


export function Header({ onAvatarClick }: HeaderProps) {

  const auth = useAuth()
  const user = auth?.user


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image src="/images.png?height=60&width=60" alt="SAIL Logo" width={55} height={55} className="rounded-md" />
      </Link>

      <button
        onClick={onAvatarClick}
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Open user menu"
      >
        <Avatar className="h-10 w-10 cursor-pointer transition-transform hover:scale-105">
          <AvatarImage src={user?.name || ""} alt={user?.id || "User"} />
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </button>
    </header>
  )
}

