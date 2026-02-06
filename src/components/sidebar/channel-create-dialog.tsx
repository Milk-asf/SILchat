"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useChatContext } from "@/components/providers/chat-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ChannelCreateDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ChannelCreateDialog({
  isOpen,
  onClose,
}: ChannelCreateDialogProps) {
  const router = useRouter()
  const { profile, addChannel } = useChatContext()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    const { data: channel, error } = await supabase
      .from("channels")
      .insert({
        name: name.trim().toLowerCase().replace(/\s+/g, "-"),
        description: description.trim(),
        created_by: profile.id,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to create channel")
      setIsLoading(false)
      return
    }

    // Auto-join the creator
    await supabase.from("channel_members").insert({
      channel_id: channel.id,
      user_id: profile.id,
    })

    addChannel(channel)
    setName("")
    setDescription("")
    setIsLoading(false)
    onClose()
    router.push(`/chat/${channel.id}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel name</Label>
            <Input
              id="channel-name"
              placeholder="e.g. general"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel-desc">
              Description{" "}
              <span className="text-gray-400">(optional)</span>
            </Label>
            <Input
              id="channel-desc"
              placeholder="What is this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
