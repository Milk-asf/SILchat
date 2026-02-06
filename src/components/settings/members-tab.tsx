"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useChatContext } from "@/components/providers/chat-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { Profile, Invitation } from "@/lib/types"
import {
  UserPlus,
  Mail,
  Trash2,
  Shield,
  ShieldOff,
  Clock,
  Check,
  Loader2,
} from "lucide-react"

export function MembersTab() {
  const { profile: currentProfile } = useChatContext()
  const [members, setMembers] = useState<Profile[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member")
  const [isInviting, setIsInviting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    const [{ data: profilesData }, { data: invitationsData }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("invitations")
          .select("*")
          .order("created_at", { ascending: false }),
      ])

    if (profilesData) setMembers(profilesData)
    if (invitationsData) setInvitations(invitationsData)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(inviteEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    const existingMember = members.find(
      (m) => m.username === inviteEmail.split("@")[0]
    )
    if (existingMember) {
      toast.error("A user with this email may already exist")
      return
    }

    const existingInvite = invitations.find(
      (i) => i.email === inviteEmail && i.status === "pending"
    )
    if (existingInvite) {
      toast.error("This email has already been invited")
      return
    }

    setIsInviting(true)
    const supabase = createClient()

    const { error } = await supabase.from("invitations").insert({
      email: inviteEmail.trim(),
      invited_by: currentProfile.id,
      role: inviteRole,
    })

    if (error) {
      toast.error("Failed to send invitation")
      setIsInviting(false)
      return
    }

    toast.success(`Invitation sent to ${inviteEmail}`)
    setInviteEmail("")
    setInviteRole("member")
    setIsInviting(false)
    fetchData()
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId)

    if (error) {
      toast.error("Failed to revoke invitation")
      return
    }

    setInvitations((prev) => prev.filter((i) => i.id !== invitationId))
    toast.success("Invitation revoked")
  }

  const handleToggleRole = async (memberId: string, currentRole: string) => {
    if (memberId === currentProfile.id) {
      toast.error("You cannot change your own role")
      return
    }

    const newRole = currentRole === "admin" ? "member" : "admin"
    const supabase = createClient()

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", memberId)

    if (error) {
      toast.error("Failed to update role")
      return
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )
    toast.success(`Role updated to ${newRole}`)
  }

  const getInitials = (profile: Profile) =>
    profile.full_name
      ? profile.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : profile.username.slice(0, 2).toUpperCase()

  const pendingInvitations = invitations.filter((i) => i.status === "pending")
  const acceptedInvitations = invitations.filter((i) => i.status === "accepted")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Invite section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Invite people</h3>
          <p className="mt-1 text-xs text-gray-500">
            Invite new users to join your workspace by email
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="name@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInvite()
              }}
              className="h-9 pl-9 text-sm"
            />
          </div>
          <Select
            value={inviteRole}
            onValueChange={(v) => setInviteRole(v as "member" | "admin")}
          >
            <SelectTrigger className="h-9 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleInvite}
            disabled={isInviting || !inviteEmail.trim()}
            size="sm"
            className="h-9 gap-1.5"
          >
            {isInviting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserPlus className="h-3.5 w-3.5" />
            )}
            Invite
          </Button>
        </div>
      </div>

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">
            Pending invitations
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              ({pendingInvitations.length})
            </span>
          </h3>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{invitation.email}</p>
                    <p className="text-xs text-gray-400">
                      Invited as {invitation.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeInvitation(invitation.id)}
                  className="h-7 text-xs text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">
          Members
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            ({members.length})
          </span>
        </h3>
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-200 text-xs font-medium text-gray-600">
                    {getInitials(member)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {member.full_name || member.username}
                    </p>
                    {member.id === currentProfile.id && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] leading-none"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">@{member.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={member.role === "admin" ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {member.role === "admin" && (
                    <Shield className="mr-1 h-2.5 w-2.5" />
                  )}
                  {member.role}
                </Badge>
                {member.id !== currentProfile.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleRole(member.id, member.role)}
                    className="h-7 text-xs text-gray-400 hover:text-gray-600"
                    title={
                      member.role === "admin"
                        ? "Demote to member"
                        : "Promote to admin"
                    }
                  >
                    {member.role === "admin" ? (
                      <ShieldOff className="h-3.5 w-3.5" />
                    ) : (
                      <Shield className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accepted invitations */}
      {acceptedInvitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-gray-400">
            Accepted invitations
          </h3>
          <div className="space-y-1">
            {acceptedInvitations.slice(0, 5).map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center gap-2 text-xs text-gray-400"
              >
                <Check className="h-3 w-3" />
                <span>{invitation.email}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
