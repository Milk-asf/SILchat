"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useChatContext } from "@/components/providers/chat-provider"
import { ReactionBadges } from "@/components/reactions/reaction-badges"
import { ReactionPicker } from "@/components/reactions/reaction-picker"
import { formatMessageTime } from "@/lib/utils/format-date"
import { isImageFile, formatFileSize } from "@/lib/utils/file-upload"
import { MessageSquare, SmilePlus, FileText, Download, EyeOff, Eye } from "lucide-react"
import type { Message, ReactionGroup } from "@/lib/types"

interface MessageItemProps {
  message: Message
  isGrouped: boolean
  reactionGroups: ReactionGroup[]
  onToggleReaction: (emoji: string) => void
  onToggleHide?: (messageId: string, hide: boolean) => Promise<void>
  isAdmin?: boolean
  isThreadReply?: boolean
}

export function MessageItem({
  message,
  isGrouped,
  reactionGroups,
  onToggleReaction,
  onToggleHide,
  isAdmin = false,
  isThreadReply = false,
}: MessageItemProps) {
  const { openThread } = useChatContext()
  const [isHovered, setIsHovered] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const profile = message.profiles
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (profile?.username || "?").slice(0, 2).toUpperCase()

  const isHidden = message.is_hidden

  return (
    <div
      className={`group relative px-6 py-0.5 transition-colors hover:bg-gray-50/80 ${isHidden ? "opacity-40" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowPicker(false)
      }}
    >
      <div className="flex gap-3">
        {/* Avatar or spacer */}
        {isGrouped ? (
          <div className="w-8 shrink-0">
            {isHovered && (
              <span className="text-[10px] text-gray-400">
                {formatMessageTime(message.created_at).split(" ")[0]}
              </span>
            )}
          </div>
        ) : (
          <Avatar className="mt-0.5 h-8 w-8 shrink-0">
            <AvatarFallback className="bg-gray-200 text-xs font-medium text-gray-600">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {!isGrouped && (
            <div className="mb-0.5 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {profile?.full_name || profile?.username || "Unknown"}
              </span>
              <span className="text-xs text-gray-400">
                {formatMessageTime(message.created_at)}
              </span>
              {isHidden && isAdmin && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                  Hidden
                </span>
              )}
            </div>
          )}

          {/* Message text */}
          {message.content && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {message.content}
            </p>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map((attachment, i) =>
                isImageFile(attachment.type) ? (
                  <a
                    key={i}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-h-60 max-w-xs object-cover"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <a
                    key={i}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <Download className="ml-2 h-3.5 w-3.5 text-gray-400" />
                  </a>
                )
              )}
            </div>
          )}

          {/* Reactions */}
          {reactionGroups.length > 0 && (
            <ReactionBadges
              groups={reactionGroups}
              onToggle={onToggleReaction}
            />
          )}

          {/* Thread preview */}
          {!isThreadReply && (message.reply_count || 0) > 0 && (
            <button
              onClick={() => openThread(message)}
              className="mt-1 flex items-center gap-1.5 rounded-md text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 hover:underline"
              aria-label={`View ${message.reply_count} replies`}
            >
              <MessageSquare className="h-3 w-3" />
              {message.reply_count}{" "}
              {message.reply_count === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {/* Hover actions */}
      {isHovered && (
        <div className="absolute -top-3 right-6 flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-0.5 shadow-sm">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Add reaction"
          >
            <SmilePlus className="h-3.5 w-3.5" />
          </button>
          {!isThreadReply && (
            <button
              onClick={() => openThread(message)}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Reply in thread"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
          )}
          {isAdmin && onToggleHide && (
            <button
              onClick={() => onToggleHide(message.id, !isHidden)}
              className={`rounded p-1 transition-colors hover:bg-gray-100 ${
                isHidden
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              aria-label={isHidden ? "Unhide message" : "Hide message"}
              title={isHidden ? "Unhide message" : "Hide message"}
            >
              {isHidden ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Reaction picker */}
      {showPicker && (
        <div className="absolute -top-12 right-6 z-10">
          <ReactionPicker
            onSelect={(emoji) => {
              onToggleReaction(emoji)
              setShowPicker(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
