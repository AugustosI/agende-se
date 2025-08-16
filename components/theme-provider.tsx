"use client"

import { useTheme } from "next-themes"
import * as React from "react"

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  )
}
