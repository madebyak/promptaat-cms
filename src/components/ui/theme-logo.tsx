'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ThemeLogoProps {
  className?: string
  width?: number
  height?: number
}

export function ThemeLogo({ className = '', width = 160, height = 32 }: ThemeLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait for theme to be resolved on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show nothing until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div 
        className={`${className}`} 
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    )
  }

  // Determine which logo to show based on resolved theme
  const isDark = resolvedTheme === 'dark'
  const logoSrc = isDark ? '/white-promptaat-logo.svg' : '/proimptaat-black-logo.svg'
  const altText = 'PromptAAT CMS'

  return (
    <Image
      src={logoSrc}
      alt={altText}
      width={width}
      height={height}
      className={`transition-opacity duration-200 ${className}`}
      priority
    />
  )
}
