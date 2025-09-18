"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { DollarSign, TrendingDown, TrendingUp, Receipt, Plus, Wallet } from "lucide-react"

import { FinanceShell } from "@/components/FinanceShell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useLocalStorageState } from "@/lib/useLocalStorage"
import { STORAGE_KEYS, Expense, Budget, monthKey, sum } from "@/lib/financeData"

export default function DashboardPage() {
  const [expenses] = useLocalStorageState<Expense[]>(STORAGE_KEYS.expenses, [])
  const [budgets] = useLocalStorageState<Budget[]>(STORAGE_KEYS.budgets, [])

  const now = new Date()
  const currentMonth = monthKey(now)

  const recent = useMemo(
    () => [...expenses].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 8),
    [expenses]
  )

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === currentMonth),
    [expenses, currentMonth]
  )

  const totalSpentThisMonth = useMemo(() => sum(monthExpenses.map((e) => e.amount)), [monthExpenses])
  const totalBudget = useMemo(() => sum(budgets.map((b) => b.amount)), [budgets])
  const remaining = Math.max(totalBudget - totalSpentThisMonth, 0)

  const spendByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of monthExpenses) {
      map[e.category] = (map[e.category] || 0) + e.amount
    }
    return map
  }, [monthExpenses])

  return (
    <FinanceShell title="Dashboard" description="Overview of your finances at a glance">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="size-4" /> Spent This Month</CardTitle>
            <CardDescription>All expenses in {currentMonth}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">${totalSpentThisMonth.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Wallet className="size-4" /> Total Budget</CardTitle>
            <CardDescription>Sum of active budgets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4" /> Remaining</CardTitle>
            <CardDescription>Budget left this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">${remaining.toLocaleString()}</div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base"><Receipt className="size-4" /> Recent Transactions</CardTitle>
            <CardDescription>Your latest expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No expenses yet. Add your first one!</TableCell>
                  </TableRow>
                ) : (
                  recent.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                      <TableCell>{e.category}</TableCell>
                      <TableCell className="max-w-[320px] truncate">{e.description || "—"}</TableCell>
                      <TableCell className="text-right">${e.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-3 text-right">
              <Link href="/expenses"><Button size="sm"><Plus className="size-4" /> Add Expense</Button></Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base"><TrendingDown className="size-4" /> Budgets Progress</CardTitle>
            <CardDescription>Spending vs limit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.length === 0 ? (
              <div className="text-muted-foreground text-sm">No budgets yet. Create one to track progress.</div>
            ) : (
              budgets.map((b) => {
                const spent = spendByCategory[b.category] || 0
                const pct = Math.min(100, Math.round((spent / Math.max(b.amount, 1)) * 100))
                const over = spent > b.amount
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{b.category}</div>
                      <div className={over ? "text-destructive" : "text-muted-foreground"}>${spent.toLocaleString()} / ${b.amount.toLocaleString()}</div>
                    </div>
                    <Progress value={pct} />
                  </div>
                )
              })
            )}
            <div className="pt-1">
              <Link href="/budgets"><Button variant="outline" size="sm">Manage Budgets</Button></Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </FinanceShell>
  )
}