"use client"

import { Badge } from "@/components/ui/badge"

interface KeyboardShortcutBadgeProps {
  keys: string[]
  className?: string
}

export function KeyboardShortcutBadge({ keys, className = "" }: KeyboardShortcutBadgeProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {keys.map((key, index) => (
        <Badge
          key={index}
          variant="outline"
          className="bg-gray-700 border-gray-600 text-gray-300 font-mono text-xs px-1.5 py-0.5"
        >
          {key}
        </Badge>
      ))}
    </div>
  )
}
