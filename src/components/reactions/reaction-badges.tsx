"use client"

import { cn } from "@/lib/utils"
import type { ReactionGroup } from "@/lib/types"

interface ReactionBadgesProps {
  groups: ReactionGroup[]
  onToggle: (emoji: string) => void
}

export function ReactionBadges({ groups, onToggle }: ReactionBadgesProps) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {groups.map((group) => (
        <button
          key={group.emoji}
          onClick={() => onToggle(group.emoji)}
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
            group.hasReacted
              ? "border-transparent font-medium"
              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
          )}
          style={
            group.hasReacted
              ? {
                  backgroundColor: "var(--workspace-accent-light, rgba(79,70,229,0.08))",
                  color: "var(--workspace-accent, #4F46E5)",
                  borderColor: "var(--workspace-accent-medium, rgba(79,70,229,0.15))",
                }
              : undefined
          }
          aria-label={`${group.emoji} ${group.count} reactions`}
        >
          <span>{group.emoji}</span>
          <span className="font-medium">{group.count}</span>
        </button>
      ))}
    </div>
  )
}
