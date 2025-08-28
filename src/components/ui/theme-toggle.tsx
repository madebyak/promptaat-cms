'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <div className="h-6 w-11 rounded-full bg-muted" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors focus:outline-none ${
        isDark 
          ? 'bg-white border-gray-600' 
          : 'bg-gray-300 border-gray-400'
      }`}
      aria-label="Toggle theme"
      role="switch"
      aria-checked={isDark}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full border transition-transform shadow-sm ${
          isDark 
            ? 'bg-gray-800 border-gray-700 translate-x-6' 
            : 'bg-white border-gray-200 translate-x-1'
        }`}
      />
    </button>
  )
}