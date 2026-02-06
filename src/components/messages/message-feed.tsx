"use client"

import { useRef, useCallback } from "react"
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso"
import { MessageItem } from "./message-item"
import { Loader2 } from "lucide-react"
import type { Message, ReactionGroup } from "@/lib/types"
import { formatDateDivider } from "@/lib/utils/format-date"

interface MessageFeedProps {
  messages: Message[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  getReactionGroups: (messageId: string) => ReactionGroup[]
  onToggleReaction: (messageId: string, emoji: string) => void
  onToggleHide?: (messageId: string, hide: boolean) => Promise<void>
  onDelete?: (messageId: string) => Promise<void>
  onDeleteForMe?: (messageId: string) => Promise<void>
  isAdmin?: boolean
}

export function MessageFeed({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  getReactionGroups,
  onToggleReaction,
  onToggleHide,
  onDelete,
  onDeleteForMe,
  isAdmin = false,
}: MessageFeedProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  const shouldShowDateDivider = useCallback(
    (index: number) => {
      if (index === 0) return true
      const curr = new Date(messages[index].created_at).toDateString()
      const prev = new Date(messages[index - 1].created_at).toDateString()
      return curr !== prev
    },
    [messages]
  )

  // Group consecutive messages from same user
  const isGrouped = useCallback(
    (index: number) => {
      if (index === 0) return false
      const curr = messages[index]
      const prev = messages[index - 1]
      if (curr.user_id !== prev.user_id) return false
      const timeDiff =
        new Date(curr.created_at).getTime() -
        new Date(prev.created_at).getTime()
      return timeDiff < 5 * 60 * 1000 // 5 minute grouping window
    },
    [messages]
  )

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">
          No messages yet. Start the conversation!
        </p>
      </div>
    )
  }

  return (
    <Virtuoso
      ref={virtuosoRef}
      data={messages}
      initialTopMostItemIndex={messages.length - 1}
      followOutput="smooth"
      alignToBottom
      startReached={() => {
        if (hasMore) onLoadMore()
      }}
      className="flex-1"
      itemContent={(index, message) => (
        <div>
          {shouldShowDateDivider(index) && (
            <div className="flex items-center gap-3 px-6 py-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">
                {formatDateDivider(message.created_at)}
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          )}
          <MessageItem
            message={message}
            isGrouped={isGrouped(index)}
            reactionGroups={getReactionGroups(message.id)}
            onToggleReaction={(emoji) =>
              onToggleReaction(message.id, emoji)
            }
            onToggleHide={onToggleHide}
            onDelete={onDelete}
            onDeleteForMe={onDeleteForMe}
            isAdmin={isAdmin}
          />
        </div>
      )}
    />
  )
}
