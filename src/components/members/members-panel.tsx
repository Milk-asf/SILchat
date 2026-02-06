"use client"

import { useState, useEffect, useCallback } from "react"
import { X, UserPlus, UserMinus, Shield, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useChatContext } from "@/components/providers/chat-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AddMemberDialog } from "./add-member-dialog"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

interface MembersPanelProps {
  channelId: string
  onClose: () => void
}

interface MemberWithProfile {
  id: string
  user_id: string
  profile: Profile
}

export function MembersPanel({ channelId, onClose }: MembersPanelProps) {
  const { profile } = useChatContext()
  const isAdmin = profile.role === "admin"
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const fetchMembers = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("channel_members")
      .select("id, user_id, profiles(*)")
      .eq("channel_id", channelId)

    if (error) {
      console.error("Failed to fetch members:", error)
      setIsLoading(false)
      return
    }

    const mapped: MemberWithProfile[] = (data || []).map((m) => ({
      id: m.id,
      user_id: m.user_id,
      profile: m.profiles as unknown as Profile,
    }))

    setMembers(mapped)
    setIsLoading(false)
  }, [channelId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleRemoveMember = async (member: MemberWithProfile) => {
    if (member.user_id === profile.id) {
      toast.error("You can't remove yourself")
      return
    }

    setRemovingId(member.user_id)
    const supabase = createClient()

    const { error } = await supabase
      .from("channel_members")
      .delete()
      .eq("id", member.id)

    if (error) {
      toast.error("Failed to remove member")
      setRemovingId(null)
      return
    }

    setMembers((prev) => prev.filter((m) => m.id !== member.id))
    toast.success(`Removed ${member.profile.full_name || member.profile.username}`)
    setRemovingId(null)
  }

  const handleMemberAdded = () => {
    fetchMembers()
  }

  return (
    <div className="flex h-full w-[320px] flex-col border-l border-gray-200">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Members</h2>
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
            {members.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <button
              onClick={() => setShowAddDialog(true)}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Add member"
              title="Add member"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close members panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="py-2">
            {/* Admins first */}
            {members.filter((m) => m.profile.role === "admin").length > 0 && (
              <>
                <p className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                  Admins
                </p>
                {members
                  .filter((m) => m.profile.role === "admin")
                  .map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      isAdmin={isAdmin}
                      isSelf={member.user_id === profile.id}
                      isRemoving={removingId === member.user_id}
                      onRemove={handleRemoveMember}
                    />
                  ))}
                <Separator className="my-2" />
              </>
            )}

            <p className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
              Members
            </p>
            {members
              .filter((m) => m.profile.role !== "admin")
              .map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isAdmin={isAdmin}
                  isSelf={member.user_id === profile.id}
                  isRemoving={removingId === member.user_id}
                  onRemove={handleRemoveMember}
                />
              ))}

            {members.filter((m) => m.profile.role !== "admin").length === 0 && (
              <p className="px-4 py-4 text-center text-xs text-gray-400">
                No regular members yet.
              </p>
            )}
          </div>
        )}
      </div>

      <AddMemberDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        channelId={channelId}
        existingMemberIds={members.map((m) => m.user_id)}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  )
}

function MemberRow({
  member,
  isAdmin,
  isSelf,
  isRemoving,
  onRemove,
}: {
  member: MemberWithProfile
  isAdmin: boolean
  isSelf: boolean
  isRemoving: boolean
  onRemove: (member: MemberWithProfile) => void
}) {
  const p = member.profile
  const initials = p.full_name
    ? p.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : p.username.slice(0, 2).toUpperCase()

  return (
    <div className="group flex items-center justify-between px-4 py-1.5 hover:bg-gray-50">
      <div className="flex items-center gap-2.5">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-gray-200 text-[10px] font-medium text-gray-600">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-900">
              {p.full_name || p.username}
            </span>
            {isSelf && (
              <span className="text-xs text-gray-400">you</span>
            )}
            {p.role === "admin" && (
              <Shield className="h-3 w-3 text-gray-400" />
            )}
          </div>
          <p className="text-xs text-gray-500">@{p.username}</p>
        </div>
      </div>
      {isAdmin && !isSelf && (
        <Button
          size="sm"
          variant="ghost"
          className="hidden h-7 px-2 text-gray-400 hover:text-red-600 group-hover:flex"
          onClick={() => onRemove(member)}
          disabled={isRemoving}
          aria-label={`Remove ${p.full_name || p.username}`}
        >
          {isRemoving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UserMinus className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  )
}
