"use client"

import React, { useMemo, useState } from "react"
import { Save, Trash2 } from "lucide-react"

import { FinanceShell } from "@/components/FinanceShell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalStorageState } from "@/lib/useLocalStorage"
import { STORAGE_KEYS, Budget, Expense, DEFAULT_CATEGORIES, uid, monthKey, sum } from "@/lib/financeData"

export default function BudgetsPage() {
  const [budgets, setBudgets] = useLocalStorageState<Budget[]>(STORAGE_KEYS.budgets, [])
  const [expenses] = useLocalStorageState<Expense[]>(STORAGE_KEYS.expenses, [])
  const [form, setForm] = useState<{ id?: string; category: string; amount: string }>({ category: DEFAULT_CATEGORIES[0], amount: "" })

  const nowKey = monthKey(new Date())
  const spendByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of expenses.filter((e) => monthKey(e.date) === nowKey)) {
      map[e.category] = (map[e.category] || 0) + e.amount
    }
    return map
  }, [expenses, nowKey])

  function saveBudget() {
    const amountNum = parseFloat(form.amount)
    if (!form.category || isNaN(amountNum) || amountNum <= 0) return
    if (form.id) {
      setBudgets((prev) => prev.map((b) => (b.id === form.id ? { ...b, category: form.category, amount: amountNum } : b)))
    } else {
      const newB: Budget = { id: uid("bud"), category: form.category, amount: amountNum }
      setBudgets((prev) => [newB, ...prev])
    }
    setForm({ category: DEFAULT_CATEGORIES[0], amount: "" })
  }

  function editBudget(b: Budget) {
    setForm({ id: b.id, category: b.category, amount: String(b.amount) })
  }

  function deleteBudget(id: string) {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  const totalBudget = useMemo(() => sum(budgets.map((b) => b.amount)), [budgets])
  const totalSpent = useMemo(() => sum(Object.values(spendByCategory)), [spendByCategory])
  const remaining = Math.max(totalBudget - totalSpent, 0)
  const overCount = useMemo(() => budgets.filter((b) => (spendByCategory[b.category] || 0) > b.amount).length, [budgets, spendByCategory])

  // Colored badge helper for categories
  const catBadge = (c: string) => {
    const map: Record<string, string> = {
      Housing: "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
      Transportation: "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200",
      Food: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
      Utilities: "bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-200",
      Healthcare: "bg-pink-100 text-pink-700 dark:bg-pink-400/20 dark:text-pink-200",
      Entertainment: "bg-violet-100 text-violet-700 dark:bg-violet-400/20 dark:text-violet-200",
      Education: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200",
      PersonalCare: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/20 dark:text-fuchsia-200",
      Debt: "bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-200",
      Savings: "bg-teal-100 text-teal-700 dark:bg-teal-400/20 dark:text-teal-200",
      Business: "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-200",
    }
    return map[c] || "bg-secondary text-secondary-foreground"
  }

  return (
    <FinanceShell title="Budgets" description="Create and track category-wise budgets">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Budget</CardTitle>
            <CardDescription>Sum of all budgets</CardDescription>
          </CardHeader>
          <CardContent><div className="text-2xl font-semibold">${totalBudget.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spent (This Month)</CardTitle>
            <CardDescription>Across categories</CardDescription>
          </CardHeader>
          <CardContent><div className="text-2xl font-semibold">${totalSpent.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Remaining</CardTitle>
            <CardDescription>Budget left</CardDescription>
          </CardHeader>
          <CardContent><div className="text-2xl font-semibold">${remaining.toLocaleString()}</div></CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Create / Edit Budget</CardTitle>
          <CardDescription>Allocate monthly amounts per category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger aria-label="Budget category"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={saveBudget}><Save className="size-4" /> {form.id ? "Update" : "Save"}</Button>
              {form.id ? (
                <Button variant="ghost" onClick={() => setForm({ category: DEFAULT_CATEGORIES[0], amount: "" })}>Cancel</Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Budgets</CardTitle>
          <CardDescription>Spending vs limit</CardDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">Budgets: {budgets.length}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">Over budget: {overCount}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">Remaining: ${remaining.toLocaleString()}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgets.length === 0 ? (
            <div className="text-muted-foreground text-sm">No budgets. Create one above.</div>
          ) : (
            budgets.map((b) => {
              const spent = spendByCategory[b.category] || 0
              const pct = Math.min(100, Math.round((spent / Math.max(b.amount, 1)) * 100))
              const over = spent > b.amount
              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs " + catBadge(b.category)}>{b.category}</span>
                    </div>
                    <div className={over ? "text-destructive" : "text-muted-foreground"}>${spent.toLocaleString()} / ${b.amount.toLocaleString()}</div>
                  </div>
                  <Progress value={pct} />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editBudget(b)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteBudget(b.id)}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </FinanceShell>
  )
}