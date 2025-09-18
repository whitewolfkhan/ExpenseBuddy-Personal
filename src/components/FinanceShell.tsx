"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, Wallet, PieChart, LineChart, Plus, Receipt, PiggyBank, Menu, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function FinanceShell({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) {
  const pathname = usePathname()

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light")
  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("expensebuddy_theme")) as "light" | "dark" | null
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    const initial = stored || (prefersDark ? "dark" : "light")
    setTheme(initial)
  }, [])
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark")
      localStorage.setItem("expensebuddy_theme", theme)
    }
  }, [theme])

  const nav = [
    { href: "/", label: "Dashboard", icon: House },
    { href: "/expenses", label: "Expenses", icon: Receipt },
    { href: "/budgets", label: "Budgets", icon: Wallet },
    { href: "/analytics", label: "Analytics", icon: PieChart },
  ] as const

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <PiggyBank className="size-5" />
            <span className="font-semibold">ExpenseBuddy</span>
          </div>
          <div className="px-2">
            <Input placeholder="Search..." aria-label="Search" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} className="block">
                      <SidebarMenuButton isActive={pathname === item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="px-2 text-xs text-muted-foreground">Ctrl/Cmd + B to toggle</div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
            <SidebarTrigger className="md:hidden" />
            <Menu className="hidden md:block size-5 text-muted-foreground" />
            <Separator orientation="vertical" className="mx-2 h-6" />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold leading-tight">{title || "ExpenseBuddy"}</h1>
              {description ? (
                <p className="text-muted-foreground text-sm">{description}</p>
              ) : null}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Theme toggle */}
              <Button
                size="icon"
                variant="outline"
                aria-label="Toggle theme"
                className="h-8 w-8"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>

              <Link href="/expenses">
                <Button size="sm">
                  <Plus className="size-4" />
                  Add Expense
                </Button>
              </Link>
              <Link href="/budgets">
                <Button size="sm" variant="outline">
                  <Wallet className="size-4" />
                  New Budget
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <main className={cn("mx-auto w-full max-w-6xl p-4 md:p-6 space-y-6")}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}