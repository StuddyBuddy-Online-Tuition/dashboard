import type { Metadata } from 'next'
import './globals.css'
import NextAuthSessionProvider from "@/components/session-provider";

export const metadata: Metadata = {
  title: 'Student Dashboard',
  description: 'StudyBuddy Student Dashboard',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body>
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  )
}
