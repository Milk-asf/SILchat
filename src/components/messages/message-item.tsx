"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useChatContext } from "@/components/providers/chat-provider"
import { ReactionBadges } from "@/components/reactions/reaction-badges"
import { ReactionPicker } from "@/components/reactions/reaction-picker"
import { formatMessageTime } from "@/lib/utils/format-date"
import { isImageFile, formatFileSize } from "@/lib/utils/file-upload"
import { isWithinDeleteWindow } from "@/lib/hooks/use-messages"
import {
  MessageSquare,
  SmilePlus,
  FileText,
  Download,
  EyeOff,
  Eye,
  Trash2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import type { Message, ReactionGroup } from "@/lib/types"

interface MessageItemProps {
  message: Message
  isGrouped: boolean
  reactionGroups: ReactionGroup[]
  onToggleReaction: (emoji: string) => void
  onToggleHide?: (messageId: string, hide: boolean) => Promise<void>
  onDelete?: (messageId: string) => Promise<void>
  onDeleteForMe?: (messageId: string) => Promise<void>
  isAdmin?: boolean
  isThreadReply?: boolean
}

export function MessageItem({
  message,
  isGrouped,
  reactionGroups,
  onToggleReaction,
  onToggleHide,
  onDelete,
  onDeleteForMe,
  isAdmin = false,
  isThreadReply = false,
}: MessageItemProps) {
  const { profile, openThread } = useChatContext()
  const [isHovered, setIsHovered] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [showDeleteMenu, setShowDeleteMenu] = useState(false)
  const [canDeleteForAll, setCanDeleteForAll] = useState(false)

  const isOwnMessage = message.user_id === profile.id
  const msgProfile = message.profiles
  const initials = msgProfile?.full_name
    ? msgProfile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (msgProfile?.username || "?").slice(0, 2).toUpperCase()

  const isHidden = message.is_hidden

  // Update the "can delete for all" state on a timer
  useEffect(() => {
    if (!isOwnMessage && !isAdmin) {
      setCanDeleteForAll(false)
      return
    }

    // Admins can always delete for all
    if (isAdmin) {
      setCanDeleteForAll(true)
      return
    }

    // For own messages, check the 3-minute window
    const withinWindow = isWithinDeleteWindow(message.created_at)
    setCanDeleteForAll(withinWindow)

    if (!withinWindow) return

    // Set a timer to flip the flag when the window expires
    const messageAge =
      Date.now() - new Date(message.created_at).getTime()
    const remaining = 3 * 60 * 1000 - messageAge

    if (remaining <= 0) {
      setCanDeleteForAll(false)
      return
    }

    const timer = setTimeout(() => {
      setCanDeleteForAll(false)
    }, remaining)

    return () => clearTimeout(timer)
  }, [message.created_at, isOwnMessage, isAdmin])

  const handleDeleteForAll = async () => {
    if (!onDelete) return
    try {
      await onDelete(message.id)
      toast.success("Message deleted")
    } catch {
      toast.error("Failed to delete message")
    }
    setShowDeleteMenu(false)
  }

  const handleDeleteForMe = async () => {
    if (!onDeleteForMe) return
    try {
      await onDeleteForMe(message.id)
      toast.success("Message removed for you")
    } catch {
      toast.error("Failed to remove message")
    }
    setShowDeleteMenu(false)
  }

  return (
    <div
      className={`group relative px-6 py-0.5 transition-colors hover:bg-gray-50/80 ${isHidden ? "opacity-40" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowPicker(false)
        setShowDeleteMenu(false)
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
                {msgProfile?.full_name || msgProfile?.username || "Unknown"}
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
              className="mt-1 flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors hover:underline"
              style={{ color: "var(--workspace-accent, #4F46E5)" }}
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
          {/* Delete button — show for own messages or admins */}
          {(isOwnMessage || isAdmin) && (
            <div className="relative">
              <button
                onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Delete message"
                title="Delete message"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {/* Delete dropdown */}
              {showDeleteMenu && (
                <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {canDeleteForAll && (
                    <button
                      onClick={handleDeleteForAll}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <div>
                        <p className="font-medium">Delete for everyone</p>
                        {!isAdmin && (
                          <p className="text-[10px] text-red-400">
                            Available for{" "}
                            {getRemainingTime(message.created_at)}
                          </p>
                        )}
                      </div>
                    </button>
                  )}
                  {isOwnMessage && !canDeleteForAll && (
                    <div className="px-3 py-1.5">
                      <p className="text-[10px] text-gray-400">
                        Delete for everyone expired (3 min limit)
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleDeleteForMe}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <p className="font-medium">Delete for me</p>
                  </button>
                </div>
              )}
            </div>
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

function getRemainingTime(createdAt: string): string {
  const elapsed = Date.now() - new Date(createdAt).getTime()
  const remaining = 3 * 60 * 1000 - elapsed
  if (remaining <= 0) return "0s"
  const seconds = Math.ceil(remaining / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}
