"use client"

import { useMemo } from "react"
import { X, MessageSquare } from "lucide-react"
import { useChatContext } from "@/components/providers/chat-provider"
import { useThread } from "@/lib/hooks/use-thread"
import { useReactions } from "@/lib/hooks/use-reactions"
import { MessageItem } from "@/components/messages/message-item"
import { MessageInput } from "@/components/messages/message-input"
import { Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "@/lib/types"

interface ThreadPanelProps {
  parentMessage: Message
  channelId: string
}

export function ThreadPanel({ parentMessage, channelId }: ThreadPanelProps) {
  const { profile, closeThread } = useChatContext()
  const { replies, isLoading, sendReply } = useThread(parentMessage.id)

  const allMessageIds = useMemo(
    () => [parentMessage.id, ...replies.map((r) => r.id)],
    [parentMessage.id, replies]
  )
  const { getReactionGroups, toggleReaction } = useReactions(
    allMessageIds,
    profile.id
  )

  const handleSend = async (content: string, attachments?: Message["attachments"]) => {
    await sendReply(content, channelId, attachments)
  }

  // Dummy typing handlers (no typing indicators in threads)
  const noop = () => {}

  return (
    <div className="flex h-full w-[360px] flex-col border-l border-gray-200">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Thread</h2>
        </div>
        <button
          onClick={closeThread}
          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close thread"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Parent message */}
      <div className="border-b border-gray-100 py-2">
        <MessageItem
          message={parentMessage}
          isGrouped={false}
          reactionGroups={getReactionGroups(parentMessage.id)}
          onToggleReaction={(emoji) =>
            toggleReaction(parentMessage.id, emoji)
          }
          isThreadReply
        />
      </div>

      {/* Replies */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : replies.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No replies yet
          </p>
        ) : (
          <div className="py-2">
            {replies.map((reply, index) => {
              const isGrouped =
                index > 0 && replies[index - 1].user_id === reply.user_id
              return (
                <MessageItem
                  key={reply.id}
                  message={reply}
                  isGrouped={isGrouped}
                  reactionGroups={getReactionGroups(reply.id)}
                  onToggleReaction={(emoji) =>
                    toggleReaction(reply.id, emoji)
                  }
                  isThreadReply
                />
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Reply input */}
      <MessageInput
        onSend={handleSend}
        onTyping={noop}
        onStopTyping={noop}
        channelName=""
        userId={profile.id}
        placeholder="Reply..."
      />
    </div>
  )
}
