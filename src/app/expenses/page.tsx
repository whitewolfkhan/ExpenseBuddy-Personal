"use client"

import React, { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Save, Trash2, Search, Sun, Moon } from "lucide-react"

import { FinanceShell } from "@/components/FinanceShell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalStorageState } from "@/lib/useLocalStorage"
import { STORAGE_KEYS, Expense, DEFAULT_CATEGORIES, uid } from "@/lib/financeData"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useLocalStorageState<Expense[]>(STORAGE_KEYS.expenses, [])
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null
    const initial = stored ?? (document.documentElement.classList.contains("dark") ? "dark" : "light")
    setTheme(initial)
    document.documentElement.classList.toggle("dark", initial === "dark")
  }, [])

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.classList.toggle("dark", next === "dark")
    localStorage.setItem("theme", next)
  }

  const [form, setForm] = useState<{ id?: string; date: string; amount: string; category: string; description: string }>(() => ({
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    category: DEFAULT_CATEGORIES[0],
    description: "",
  }))

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => (categoryFilter === "all" ? true : e.category === categoryFilter))
      .filter((e) =>
        query.trim() ? `${e.description ?? ""} ${e.category}`.toLowerCase().includes(query.toLowerCase()) : true
      )
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }, [expenses, categoryFilter, query])

  const filteredTotal = useMemo(() => filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0), [filtered])
  const allTimeTotal = useMemo(() => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0), [expenses])

  function categoryBadgeClasses(cat: string) {
    const m: Record<string, string> = {
      Food: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      Groceries: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      Transport: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
      Travel: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
      Housing: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      Utilities: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      Entertainment: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
      Shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
      Health: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
      Other: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
    }
    return m[cat] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
  }

  function saveExpense() {
    const amountNum = parseFloat(form.amount)
    if (!form.date || !form.category || isNaN(amountNum) || amountNum <= 0) return
    if (form.id) {
      setExpenses((prev) => prev.map((e) => (e.id === form.id ? { ...e, date: form.date, amount: amountNum, category: form.category, description: form.description || undefined } : e)))
    } else {
      const newE: Expense = { id: uid("exp"), date: form.date, amount: amountNum, category: form.category, description: form.description || undefined }
      setExpenses((prev) => [newE, ...prev])
    }
    setForm({ date: new Date().toISOString().slice(0, 10), amount: "", category: DEFAULT_CATEGORIES[0], description: "" })
  }

  function editExpense(e: Expense) {
    setForm({ id: e.id, date: e.date.slice(0, 10), amount: String(e.amount), category: e.category, description: e.description || "" })
  }

  function deleteExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <FinanceShell title="Expenses" description="Add, filter, and manage your expenses">
      <Card>
        <CardHeader className="flex items-start justify-between gap-2 border-b">
          <div>
            <CardTitle className="text-base">Add / Edit Expense</CardTitle>
            <CardDescription>Record a new transaction</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger aria-label="Category"><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Optional" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={saveExpense}><Save className="size-4" /> {form.id ? "Update" : "Save"}</Button>
            {form.id ? (
              <Button variant="ghost" onClick={() => setForm({ date: new Date().toISOString().slice(0, 10), amount: "", category: DEFAULT_CATEGORIES[0], description: "" })}>Cancel</Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Expense History</CardTitle>
          <CardDescription>Filter and search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search description or category" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger aria-label="Filter by category"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {DEFAULT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:justify-self-end">
              <Button asChild variant="outline"><Link href="/budgets"><Plus className="size-4" /> New Budget</Link></Button>
            </div>
          </div>

          {/* Dynamic summary chips */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" /> {filtered.length} items
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-chart-2/15 px-3 py-1 text-xs font-medium text-chart-2">
              <span className="h-2 w-2 rounded-full bg-chart-2" /> Filtered total: ${filteredTotal.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-chart-4/15 px-3 py-1 text-xs font-medium text-chart-4">
              <span className="h-2 w-2 rounded-full bg-chart-4" /> All-time: ${allTimeTotal.toLocaleString()}
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No matching expenses.</TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClasses(e.category)}`}>
                        {e.category}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate">{e.description || "—"}</TableCell>
                    <TableCell className="text-right font-medium text-rose-600 dark:text-rose-300">${e.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => editExpense(e)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteExpense(e.id)}><Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </FinanceShell>
  )
}