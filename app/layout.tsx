import type { Metadata } from 'next'
import './globals.css'
import NextAuthSessionProvider from "@/components/session-provider";

export const metadata: Metadata = {
  title: 'Student Dashboard',
  description: 'StudyBuddy Student Dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  )
}
