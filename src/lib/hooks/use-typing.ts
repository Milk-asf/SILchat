"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface TypingUser {
  userId: string
  username: string
}

export function useTyping(channelId: string, currentUserId: string, currentUsername: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase.channel(`typing:${channelId}`, {
      config: {
        presence: { key: currentUserId },
      },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const users: TypingUser[] = []

        Object.entries(state).forEach(([key, presences]) => {
          if (key === currentUserId) return
          const presence = presences[0] as { is_typing?: boolean; username?: string }
          if (presence?.is_typing) {
            users.push({
              userId: key,
              username: presence.username || "Someone",
            })
          }
        })

        setTypingUsers(users)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      supabase.removeChannel(channel)
    }
  }, [channelId, currentUserId])

  const startTyping = useCallback(() => {
    if (!channelRef.current) return

    channelRef.current.track({
      is_typing: true,
      username: currentUsername,
    })

    // Auto-stop after 2 seconds
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      channelRef.current?.track({
        is_typing: false,
        username: currentUsername,
      })
    }, 2000)
  }, [currentUsername])

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    channelRef.current?.track({
      is_typing: false,
      username: currentUsername,
    })
  }, [currentUsername])

  return { typingUsers, startTyping, stopTyping }
}
