"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { CommandMenuProvider } from "./command-menu-provider"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/signup") &&
      !pathname.startsWith("/forgot-password")
    ) {
      router.push("/login")
    }
  }, [user, isLoading, router, pathname])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <CommandMenuProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader sidebarCollapsed={sidebarCollapsed} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </CommandMenuProvider>
  )
}
