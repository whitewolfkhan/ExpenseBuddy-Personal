export type Expense = {
  id: string
  date: string // ISO date
  amount: number
  category: string
  description?: string
}

export type Budget = {
  id: string
  category: string
  amount: number // monthly budget amount
}

export const DEFAULT_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Education",
  "PersonalCare",
  "Debt",
  "Savings",
  "Business",
] as const

export type Category = (typeof DEFAULT_CATEGORIES)[number]

export const STORAGE_KEYS = {
  expenses: "expensebuddy_expenses",
  budgets: "expensebuddy_budgets",
} as const

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`
}

export function monthKey(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0)
}