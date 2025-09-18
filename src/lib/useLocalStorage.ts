"use client"

import { useEffect, useState } from "react"

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialValue
    } catch (e) {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])

  return [state, setState] as const
}