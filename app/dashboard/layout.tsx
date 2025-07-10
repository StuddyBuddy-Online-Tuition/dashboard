import type React from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import DashboardClientLayout from "@/components/common/dashboard-client-layout"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/")
  }

  return (
    <DashboardClientLayout user={session.user}>
      {children}
    </DashboardClientLayout>
  )
}
