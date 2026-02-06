"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserPlus, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

interface AddMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  channelId: string
  existingMemberIds: string[]
  onMemberAdded: () => void
}

export function AddMemberDialog({
  isOpen,
  onClose,
  channelId,
  existingMemberIds,
  onMemberAdded,
}: AddMemberDialogProps) {
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const fetchUsers = async () => {
      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true })

      if (error) {
        console.error("Failed to fetch users:", error)
        setIsLoading(false)
        return
      }

      setAllUsers(data || [])
      setIsLoading(false)
    }

    fetchUsers()
  }, [isOpen])

  const availableUsers = allUsers.filter((u) => {
    if (existingMemberIds.includes(u.id)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      u.username.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q)
    )
  })

  const handleAdd = async (userId: string) => {
    setAddingId(userId)
    const supabase = createClient()

    const { error } = await supabase.from("channel_members").insert({
      channel_id: channelId,
      user_id: userId,
    })

    if (error) {
      toast.error("Failed to add member")
      setAddingId(null)
      return
    }

    const user = allUsers.find((u) => u.id === userId)
    toast.success(`Added ${user?.full_name || user?.username}`)
    setAddingId(null)
    onMemberAdded()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add members</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : availableUsers.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              {search.trim()
                ? "No users match your search."
                : "All users are already in this channel."}
            </p>
          ) : (
            availableUsers.map((user) => {
              const initials = user.full_name
                ? user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : user.username.slice(0, 2).toUpperCase()

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-gray-200 text-[10px] font-medium text-gray-600">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(user.id)}
                    disabled={addingId === user.id}
                    className="h-7 gap-1 px-2"
                  >
                    {addingId === user.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserPlus className="h-3 w-3" />
                    )}
                    Add
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
