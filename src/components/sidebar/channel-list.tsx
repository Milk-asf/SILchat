"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Hash, Plus } from "lucide-react"
import { useChatContext } from "@/components/providers/chat-provider"
import { ChannelCreateDialog } from "./channel-create-dialog"
import { JoinChannelDialog } from "./join-channel-dialog"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function ChannelList() {
  const pathname = usePathname()
  const { channels, memberChannelIds, profile } = useChatContext()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

  const isAdmin = profile.role === "admin"
  const joinedChannels = channels.filter((c) =>
    memberChannelIds.includes(c.id)
  )

  return (
    <div className="flex-1 overflow-y-auto px-2 py-3">
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Channels
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            aria-label="Browse channels"
            title="Browse channels"
          >
            <Hash className="h-3.5 w-3.5" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
              aria-label="Create channel"
              title="Create channel"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <nav className="space-y-0.5">
        {joinedChannels.map((channel) => {
          const isActive = pathname === `/chat/${channel.id}`
          return (
            <Link
              key={channel.id}
              href={`/chat/${channel.id}`}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "font-medium text-gray-900"
                  : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: "var(--workspace-accent-light, rgba(79,70,229,0.08))",
                      color: "var(--workspace-accent, #4F46E5)",
                    }
                  : undefined
              }
            >
              <Hash
                className="h-3.5 w-3.5 shrink-0"
                style={
                  isActive
                    ? { color: "var(--workspace-accent, #4F46E5)" }
                    : { color: "#9ca3af" }
                }
              />
              <span className="truncate">{channel.name}</span>
            </Link>
          )
        })}

        {joinedChannels.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-gray-400">
            No channels yet.
            {isAdmin
              ? " Create one to get started."
              : " Ask an admin to add you."}
          </p>
        )}
      </nav>

      <ChannelCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <JoinChannelDialog
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
    </div>
  )
}
