"use client"

import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbNavProps {
  path: string[]
  onNavigate: (path: string[]) => void
}

export function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <button
        onClick={() => onNavigate([])}
        className="flex items-center hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </button>
      {path.map((segment, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate(path.slice(0, index + 1))}
            className="ml-2 hover:text-foreground"
          >
            {segment}
          </button>
        </div>
      ))}
    </nav>
  )
}