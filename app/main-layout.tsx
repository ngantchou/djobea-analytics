// app/main-layout.tsx
"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layouts/app-sidebar"
import { Header } from "@/components/layouts/header"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Define public routes that should not have header and sidebar
  const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)

  if (isPublicRoute) {
    // Public pages - no sidebar or header
    return <main className="min-h-screen">{children}</main>
  }

  // Dashboard pages - with sidebar and header
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}