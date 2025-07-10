"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DashboardSidebar from "@/components/common/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem("sidebarCollapsed");
    if (savedSidebarState) {
      setSidebarCollapsed(savedSidebarState === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="flex h-screen w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:block relative transition-all duration-300 ease-in-out border-r border-secondary/20 bg-white ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <DashboardSidebar
            user={session?.user}
            sidebarCollapsed={sidebarCollapsed}
          />

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
                <DashboardSidebar
                  user={session?.user}
                  sidebarCollapsed={false} // Always expanded on mobile
                />
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
  );
}
