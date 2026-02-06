"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useChatContext } from "@/components/providers/chat-provider"
import { hasAdminAccess } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Shield, ShieldCheck } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  member: "Member",
}

export function UserMenu() {
  const router = useRouter()
  const { profile } = useChatContext()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile.username.slice(0, 2).toUpperCase()

  const isAdmin = hasAdminAccess(profile)

  return (
    <div className="border-t border-gray-200 p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex w-full items-center gap-2.5 rounded-md px-1 py-1 transition-colors hover:bg-gray-200/50"
            aria-label="User menu"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gray-200 text-xs font-medium text-gray-600">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="truncate text-sm font-medium text-gray-900">
                {profile.full_name || profile.username}
              </p>
            </div>
            {isAdmin && (
              profile.role === "super_admin" ? (
                <ShieldCheck
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--workspace-accent, #4F46E5)" }}
                />
              ) : (
                <Shield
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--workspace-accent, #4F46E5)" }}
                />
              )
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{profile.full_name}</p>
            <p className="text-xs text-gray-500">@{profile.username}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {ROLE_LABELS[profile.role] || profile.role}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
