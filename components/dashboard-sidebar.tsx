"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Users, ClipboardList, UserX, LogOut } from "lucide-react"

interface DashboardSidebarProps {
  user: {
    name: string
  }
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
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
      title: "Inactive Students",
      icon: UserX,
      path: "/dashboard/inactive",
      active: pathname === "/dashboard/inactive",
    },
  ]

  return (
    <SidebarProvider>
      <Sidebar className="border-r w-64">
        <SidebarHeader className="p-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="text-lg font-bold text-primary-foreground">CB</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">CoverBuddy</h2>
              <p className="text-sm text-muted-foreground">Student Management</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <div className="mb-6 mt-2 rounded-lg bg-sky-50 p-4">
            <p className="text-sm text-muted-foreground">Welcome,</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.active}>
                  <Link href={item.path} className="flex items-center">
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
