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
import { Hash } from "lucide-react"
import { toast } from "sonner"

interface JoinChannelDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function JoinChannelDialog({
  isOpen,
  onClose,
}: JoinChannelDialogProps) {
  const router = useRouter()
  const { profile, channels, memberChannelIds, joinChannel } = useChatContext()
  const [joiningId, setJoiningId] = useState<string | null>(null)

  const unjoinedChannels = channels.filter(
    (c) => !memberChannelIds.includes(c.id)
  )

  const handleJoin = async (channelId: string) => {
    setJoiningId(channelId)
    const supabase = createClient()

    const { error } = await supabase.from("channel_members").insert({
      channel_id: channelId,
      user_id: profile.id,
    })

    if (error) {
      toast.error("Failed to join channel")
      setJoiningId(null)
      return
    }

    joinChannel(channelId)
    setJoiningId(null)
    onClose()
    router.push(`/chat/${channelId}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Browse channels</DialogTitle>
        </DialogHeader>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {unjoinedChannels.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              You&apos;ve joined all available channels.
            </p>
          ) : (
            unjoinedChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {channel.name}
                    </p>
                    {channel.description && (
                      <p className="text-xs text-gray-500">
                        {channel.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleJoin(channel.id)}
                  disabled={joiningId === channel.id}
                >
                  {joiningId === channel.id ? "Joining..." : "Join"}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
