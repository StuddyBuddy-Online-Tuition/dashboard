"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Users,
    UsersRound,
    ClipboardList,
    UserX,
    LogOut,
    Clock,
    BookOpen,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    ChevronRight,
} from "lucide-react"
import { usePathname } from "next/navigation"

interface DashboardSidebarProps {
  user: { name: string } | null
  sidebarCollapsed: boolean
  handleLogout: () => void
}

export default function DashboardSidebar({
  user,
  sidebarCollapsed,
  handleLogout,
}: DashboardSidebarProps) {
    const pathname = usePathname()

    const isStudentsRoute = [
        "/dashboard",
        "/dashboard/students",
        "/dashboard/pending",
        "/dashboard/trial",
        "/dashboard/inactive",
        "/dashboard/removed",
    ].includes(pathname)

    const [studentsOpen, setStudentsOpen] = useState(false)

    useEffect(() => {
        setStudentsOpen(isStudentsRoute)
    }, [isStudentsRoute])

    const isSubjectsRoute = pathname.startsWith("/dashboard/subjects")
    const [subjectsOpen, setSubjectsOpen] = useState(false)
    useEffect(() => {
        setSubjectsOpen(isSubjectsRoute)
    }, [isSubjectsRoute])

    const studentSubItems = [
        {
            title: "All Students",
            icon: UsersRound,
            path: "/dashboard/students",
            active: pathname === "/dashboard/students",
        },
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
            title: "Removed Students",
            icon: UserX,
            path: "/dashboard/removed",
            active: pathname === "/dashboard/removed",
        },
    ]

    const subjectSubItems = [
        {
            title: "Subject List",
            icon: BookOpen,
            path: "/dashboard/subjects",
            active: pathname === "/dashboard/subjects",
        },
        {
            title: "Master Timetable",
            icon: CalendarDays,
            path: "/dashboard/subjects/master",
            active: pathname === "/dashboard/subjects/master",
        },
      {
        title: "1-to-1 Timetable",
        icon: CalendarDays,
        path: "/dashboard/subjects/one-to-one",
        active: pathname === "/dashboard/subjects/one-to-one",
      },
    ]

    const menuItems = [
        {
            title: "Users",
            icon: UsersRound,
            path: "/dashboard/users",
            active: pathname === "/dashboard/users",
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
            <p className="font-medium text-navy">{user.name}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-2 py-4">
        <ul className="space-y-1">
          {/* Students parent */}
          <li>
            <button
              type="button"
              onClick={() => setStudentsOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium ${
                (isStudentsRoute || studentsOpen)
                  ? "bg-gradient-to-r from-secondary to-primary text-white"
                  : "text-navy hover:bg-accent/20"
              }`}
              title={sidebarCollapsed ? "Students" : undefined}
            >
              <span className="flex items-center">
                <UsersRound className={`h-5 w-5 ${!sidebarCollapsed && "mr-2"}`} />
                {!sidebarCollapsed && <span>Students</span>}
              </span>
              {!sidebarCollapsed && (
                studentsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )
              )}
            </button>
          </li>
          {/* Students submenu */}
          {!sidebarCollapsed && studentsOpen && (
            <li>
              <ul className="space-y-1 ml-6">
                {studentSubItems.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                        item.active
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "text-navy hover:bg-accent/20"
                      }`}
                    >
                      <span className="flex items-center">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )}
          {/* Subjects parent */}
          <li>
            <button
              type="button"
              onClick={() => setSubjectsOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium ${
                (isSubjectsRoute || subjectsOpen)
                  ? "bg-gradient-to-r from-secondary to-primary text-white"
                  : "text-navy hover:bg-accent/20"
              }`}
              title={sidebarCollapsed ? "Subjects" : undefined}
            >
              <span className="flex items-center">
                <BookOpen className={`h-5 w-5 ${!sidebarCollapsed && "mr-2"}`} />
                {!sidebarCollapsed && <span>Subjects</span>}
              </span>
              {!sidebarCollapsed && (
                subjectsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )
              )}
            </button>
          </li>
          {/* Subjects submenu */}
          {!sidebarCollapsed && subjectsOpen && (
            <li>
              <ul className="space-y-1 ml-6">
                {subjectSubItems.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                        item.active
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "text-navy hover:bg-accent/20"
                      }`}
                    >
                      <span className="flex items-center">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )}
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
}
