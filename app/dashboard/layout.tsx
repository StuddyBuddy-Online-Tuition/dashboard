"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import {
  Users,
  ClipboardList,
  UserX,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/")
    }

    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem("sidebarCollapsed")
    if (savedSidebarState) {
      setSidebarCollapsed(savedSidebarState === "true")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  const menuItems = [
    {
      title: "Active Students",
      icon: Users,
      path: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      title: "Pending Students",
      icon: ClipboardList,
      path: "/dashboard/pending",
      active: pathname === "/dashboard/pending",
    },
    {
      title: "Trial Students",
      icon: Clock,
      path: "/dashboard/trial",
      active: pathname === "/dashboard/trial",
    },
    {
      title: "Inactive Students",
      icon: UserX,
      path: "/dashboard/inactive",
      active: pathname === "/dashboard/inactive",
    },
    {
      title: "Subjects",
      icon: BookOpen,
      path: "/dashboard/subjects",
      active: pathname === "/dashboard/subjects",
    },
    {
      title: "Finance/Payment",
      icon: DollarSign,
      path: "/dashboard/finance",
      active: pathname === "/dashboard/finance",
    },
  ]

  if (!mounted) return null

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  // Sidebar content component to avoid duplication
  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-secondary/20">
        <div className="flex items-center space-x-2">
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RPBHhgmAbisCI5Y9Lg6k9Rb3r9DtKr.png"
              alt="StudyBuddy Logo"
              fill
              className="object-contain"
            />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-navy">StudyBuddy</h2>
              <p className="text-sm text-muted-foreground">Student Management</p>
            </div>
          )}
        </div>
      </div>

      {/* User welcome */}
      {!sidebarCollapsed && (
        <div className="p-4">
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
            <p className="text-sm text-muted-foreground">Welcome,</p>
            <p className="font-medium text-navy">{user.name}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-2 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              <Link
                href={item.path}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  item.active ? "bg-gradient-to-r from-secondary to-primary text-white" : "text-navy hover:bg-accent/20"
                }`}
                title={sidebarCollapsed ? item.title : undefined}
              >
                <item.icon className={`h-5 w-5 ${!sidebarCollapsed && "mr-2"}`} />
                {!sidebarCollapsed && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className={`absolute bottom-0 ${sidebarCollapsed ? "w-16" : "w-64"} border-t border-secondary/20 p-4`}>
        <Button
          variant="outline"
          className="w-full justify-start border-secondary/20 text-navy hover:bg-accent/20 hover:text-navy bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className={`h-4 w-4 ${!sidebarCollapsed && "mr-2"}`} />
          {!sidebarCollapsed && "Logout"}
        </Button>
      </div>
    </>
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="flex h-screen w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:block relative transition-all duration-300 ease-in-out border-r border-secondary/20 bg-white ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <SidebarContent />

          {/* Collapse toggle button */}
          <button
            onClick={toggleSidebar}
            className={`absolute top-1/2 -translate-y-1/2 flex h-8 w-6 items-center justify-center rounded-r-md border border-l-0 border-secondary/30 bg-white shadow-lg text-navy hover:bg-accent/20 z-30 transition-all duration-300 ${
              sidebarCollapsed ? "-right-6" : "-right-6"
            }`}
            style={{
              right: "-24px",
            }}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-primary" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-primary" />
            )}
          </button>
        </aside>

        {/* Mobile Sidebar (Sheet/Drawer) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-50 text-navy">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 border-secondary/20">
              <div className="relative h-full">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-primary/5 to-secondary/5 p-6 pt-16 md:pt-6 transition-all duration-300">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}
