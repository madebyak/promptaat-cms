'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Settings,
  Users,
  BarChart3,
  Image,
  User,
  ChevronLeft,
  ChevronRight,
  Wrench,
  MessageSquareText,
  Package
} from 'lucide-react'

const platformItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: FolderOpen,
  },
  {
    name: 'Tools',
    href: '/tools',
    icon: Wrench,
  },
]

const toolsItems = [
  {
    name: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    name: 'Prompt Request',
    href: '/prompt-request',
    icon: MessageSquareText,
  },
  {
    name: 'Change Log',
    href: '/change-log',
    icon: FileText,
  },
  {
    name: 'Admin Roles',
    href: '/admin-roles',
    icon: User,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

const promptItems = [
  {
    name: 'Text Prompts',
    href: '/text-prompts',
    icon: MessageSquareText,
  },
  {
    name: 'Prompt Kits',
    href: '/prompt-kits',
    icon: Package,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`relative flex flex-col bg-background border-r border-border transition-all duration-300 sticky top-0 h-screen ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Platform Label */}
        <div className={`px-3 transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'h-0 mb-0 opacity-0' : 'h-auto mb-4 opacity-100'
        }`}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Platform
          </p>
        </div>

        {/* Platform Navigation */}
        <nav className="space-y-1 px-3">
          {platformItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                style={isActive ? {backgroundColor: '#A2AADB'} : {}}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="relative w-full h-5 flex items-center overflow-hidden">
                  {/* Icon container - always in the same spot */}
                  <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Text container with smooth animation */}
                  <div className={`transition-all duration-300 overflow-hidden ${
                    isCollapsed 
                      ? 'opacity-0 w-0' 
                      : 'opacity-100 w-auto'
                  }`}>
                    <span className="ml-3 whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Prompts Label */}
        <div className={`px-3 mt-6 transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'h-0 mb-0 opacity-0' : 'h-auto mb-4 opacity-100'
        }`}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Prompts
          </p>
        </div>

        {/* Prompts Navigation */}
        <nav className="space-y-1 px-3">
          {promptItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                style={isActive ? {backgroundColor: '#A2AADB'} : {}}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="relative w-full h-5 flex items-center overflow-hidden">
                  {/* Icon container - always in the same spot */}
                  <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Text container with smooth animation */}
                  <div className={`transition-all duration-300 overflow-hidden ${
                    isCollapsed 
                      ? 'opacity-0 w-0' 
                      : 'opacity-100 w-auto'
                  }`}>
                    <span className="ml-3 whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Tools Label */}
        <div className={`px-3 mt-6 transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'h-0 mb-0 opacity-0' : 'h-auto mb-4 opacity-100'
        }`}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tools
          </p>
        </div>

        {/* Tools Navigation */}
        <nav className="space-y-1 px-3">
          {toolsItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                style={isActive ? {backgroundColor: '#A2AADB'} : {}}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="relative w-full h-5 flex items-center overflow-hidden">
                  {/* Icon container - always in the same spot */}
                  <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Text container with smooth animation */}
                  <div className={`transition-all duration-300 overflow-hidden ${
                    isCollapsed 
                      ? 'opacity-0 w-0' 
                      : 'opacity-100 w-auto'
                  }`}>
                    <span className="ml-3 whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Toggle Button - Enhanced design */}
      <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="group w-6 h-8 bg-background border border-border rounded-md hover:bg-accent hover:border-accent-foreground transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="w-full h-full flex items-center justify-center">
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-accent-foreground transition-colors duration-200" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-muted-foreground group-hover:text-accent-foreground transition-colors duration-200" />
            )}
          </div>
        </button>
      </div>
    </div>
  )
}