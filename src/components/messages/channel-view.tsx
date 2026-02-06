"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Hash, Users, Trash2, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useChatContext } from "@/components/providers/chat-provider"
import { hasAdminAccess } from "@/lib/utils"
import { useMessages } from "@/lib/hooks/use-messages"
import { useTyping } from "@/lib/hooks/use-typing"
import { useReactions } from "@/lib/hooks/use-reactions"
import { MessageFeed } from "./message-feed"
import { MessageInput } from "./message-input"
import { TypingIndicator } from "./typing-indicator"
import { ThreadPanel } from "@/components/threads/thread-panel"
import { MembersPanel } from "@/components/members/members-panel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { Channel } from "@/lib/types"

interface ChannelViewProps {
  channel: Channel
}

export function ChannelView({ channel }: ChannelViewProps) {
  const router = useRouter()
  const { profile, activeThreadMessage, removeChannel } = useChatContext()
  const isAdmin = hasAdminAccess(profile)
  const { messages, isLoading, hasMore, loadMore, sendMessage, toggleHideMessage, deleteMessage, deleteForMe } =
    useMessages(channel.id, isAdmin)
  const { typingUsers, startTyping, stopTyping } = useTyping(
    channel.id,
    profile.id,
    profile.username
  )
  const [showMembers, setShowMembers] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const messageIds = useMemo(
    () => messages.map((m) => m.id),
    [messages]
  )
  const { getReactionGroups, toggleReaction } = useReactions(
    messageIds,
    profile.id
  )

  const handleDeleteChannel = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("channels")
      .delete()
      .eq("id", channel.id)

    if (error) {
      toast.error("Failed to delete channel")
      setIsDeleting(false)
      return
    }

    removeChannel(channel.id)
    setShowDeleteConfirm(false)
    toast.success(`#${channel.name} has been deleted`)
    router.push("/chat")
  }

  return (
    <div className="flex h-full flex-1">
      <div className="flex flex-1 flex-col">
        {/* Channel header */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <h1 className="text-sm font-semibold text-gray-900">
              {channel.name}
            </h1>
            {channel.description && (
              <>
                <span className="text-gray-300">|</span>
                <p className="text-sm text-gray-500">
                  {channel.description}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="View members"
            >
              <Users className="h-4 w-4" />
            </button>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Channel settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowMembers(true)}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage members
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete channel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Message feed */}
        <MessageFeed
          messages={messages}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          getReactionGroups={getReactionGroups}
          onToggleReaction={toggleReaction}
          onToggleHide={isAdmin ? toggleHideMessage : undefined}
          onDelete={deleteMessage}
          onDeleteForMe={deleteForMe}
          isAdmin={isAdmin}
        />

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Message input */}
        <MessageInput
          onSend={sendMessage}
          onTyping={startTyping}
          onStopTyping={stopTyping}
          channelName={channel.name}
          userId={profile.id}
        />
      </div>

      {/* Members panel */}
      {showMembers && (
        <MembersPanel
          channelId={channel.id}
          onClose={() => setShowMembers(false)}
        />
      )}

      {/* Thread panel */}
      {activeThreadMessage && !showMembers && (
        <ThreadPanel
          parentMessage={activeThreadMessage}
          channelId={channel.id}
        />
      )}

      {/* Delete channel confirmation dialog */}
      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(false)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete #{channel.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            This will permanently delete the channel and all its messages.
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChannel}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete channel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
