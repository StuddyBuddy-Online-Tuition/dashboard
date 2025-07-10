"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Users,
    ClipboardList,
    UserX,
    LogOut,
    Clock,
    BookOpen,
    DollarSign,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

interface DashboardSidebarProps {
  user: Session["user"] | null;
  sidebarCollapsed: boolean;
}

export default function DashboardSidebar({
  user,
  sidebarCollapsed,
}: DashboardSidebarProps) {
    const pathname = usePathname()

    const handleLogout = () => {
      signOut({ callbackUrl: "/" });
    };

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

  return (
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
      {!sidebarCollapsed && user && (
        <div className="p-4">
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
            <p className="text-sm text-muted-foreground">Welcome,</p>
            <p className="font-medium text-navy">{user.name ?? "User"}</p>
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
      <div
        className={`absolute bottom-0 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } border-t border-secondary/20 p-4`}
      >
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
}
