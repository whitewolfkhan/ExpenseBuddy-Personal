"use client"

import React, { useMemo } from "react"
import { FinanceShell } from "@/components/FinanceShell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { STORAGE_KEYS, Expense, monthKey } from "@/lib/financeData"
import { useLocalStorageState } from "@/lib/useLocalStorage"
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

export default function AnalyticsPage() {
  const [expenses] = useLocalStorageState<Expense[]>(STORAGE_KEYS.expenses, [])

  const byMonth = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of expenses) {
      const m = monthKey(e.date)
      map[m] = (map[m] || 0) + e.amount
    }
    return Object.entries(map)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([m, total]) => ({ month: m, total }))
  }, [expenses])

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of expenses.filter((x) => monthKey(x.date) === monthKey(new Date()))) {
      map[e.category] = (map[e.category] || 0) + e.amount
    }
    return Object.entries(map).map(([category, total]) => ({ category, total }))
  }, [expenses])

  // Summary chips data
  const monthTotal = useMemo(() => byCategory.reduce((acc, cur) => acc + cur.total, 0), [byCategory])
  const topCategory = useMemo(() => (byCategory.length ? [...byCategory].sort((a, b) => b.total - a.total)[0] : null), [byCategory])

  // Palette for category bars
  const catPalette = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  const lineConfig = { total: { label: "Total Spent", color: "hsl(var(--chart-1))" } }
  const barConfig = { total: { label: "Total Spent", color: "hsl(var(--chart-2))" } }

  return (
    <FinanceShell title="Analytics" description="Interactive insights and trends">
      {/* Summary chips */}
      <div className="mb-2 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          This month: ${monthTotal.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          Categories: {byCategory.length}
        </span>
        {topCategory ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            Top: {topCategory.category} (${topCategory.total.toLocaleString()})
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Spending by Month</CardTitle>
            <CardDescription>Trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineConfig} className="h-64">
              <LineChart data={byMonth} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Category Breakdown (This Month)</CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-64">
              <BarChart data={byCategory} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" radius={4}>
                  {byCategory.map((entry, idx) => (
                    <Cell key={entry.category} fill={catPalette[idx % catPalette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Monthly Comparison</CardTitle>
          <CardDescription>Bar vs line overlay</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineConfig} className="h-72">
            <BarChart data={byMonth} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </FinanceShell>
  )
}