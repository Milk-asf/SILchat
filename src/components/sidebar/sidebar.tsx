"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ChannelList } from "./channel-list"
import { UserMenu } from "./user-menu"
import { useChatContext } from "@/components/providers/chat-provider"
import { MessageSquare, Settings } from "lucide-react"

export function Sidebar() {
  const { workspace, profile } = useChatContext()
  const pathname = usePathname()
  const isAdmin = profile.role === "admin"
  const isSettingsActive = pathname === "/settings"

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-gray-50/50">
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          {workspace.logo_url ? (
            <Image
              src={workspace.logo_url}
              alt={workspace.name}
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg object-cover"
            />
          ) : (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: workspace.primary_color }}
            >
              <MessageSquare className="h-3.5 w-3.5 text-white" />
            </div>
          )}
          <span className="text-sm font-semibold text-gray-900">
            {workspace.name}
          </span>
        </div>
        {isAdmin && (
          <Link
            href="/settings"
            className="rounded-md p-1.5 transition-colors hover:bg-gray-200/50"
            style={{
              color: isSettingsActive
                ? "var(--workspace-accent, #4F46E5)"
                : "#9ca3af",
            }}
            aria-label="Workspace settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}
      </div>
      <ChannelList />
      <UserMenu />
    </aside>
  )
}
