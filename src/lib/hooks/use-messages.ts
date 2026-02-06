"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Message } from "@/lib/types"

const PAGE_SIZE = 50

export function useMessages(channelId: string, isAdmin: boolean) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const supabaseRef = useRef(createClient())

  // Fetch initial messages
  useEffect(() => {
    const supabase = supabaseRef.current
    setIsLoading(true)
    setMessages([])
    setHasMore(true)

    const fetchMessages = async () => {
      let query = supabase
        .from("messages")
        .select("*, profiles(*)")
        .eq("channel_id", channelId)
        .is("parent_message_id", null)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE)

      if (!isAdmin) query = query.eq("is_hidden", false)

      const { data, error } = await query

      if (error) {
        console.error("Failed to fetch messages:", error)
        setIsLoading(false)
        return
      }

      // Fetch reply counts
      const messageIds = data.map((m) => m.id)
      const { data: replyCounts } = await supabase
        .from("messages")
        .select("parent_message_id")
        .in("parent_message_id", messageIds)

      const replyCountMap: Record<string, number> = {}
      replyCounts?.forEach((r) => {
        if (r.parent_message_id) {
          replyCountMap[r.parent_message_id] =
            (replyCountMap[r.parent_message_id] || 0) + 1
        }
      })

      const messagesWithCounts = data.map((m) => ({
        ...m,
        reply_count: replyCountMap[m.id] || 0,
      }))

      setMessages(messagesWithCounts.reverse())
      setHasMore(data.length === PAGE_SIZE)
      setIsLoading(false)
    }

    fetchMessages()
  }, [channelId, isAdmin])

  // Subscribe to realtime inserts and updates
  useEffect(() => {
    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message

          // Skip hidden messages for non-admins
          if (!isAdmin && newMsg.is_hidden) return

          // Fetch the profile for this message
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMsg.user_id)
            .single()

          const enrichedMsg: Message = {
            ...newMsg,
            profiles: profile ?? undefined,
            reply_count: 0,
          }

          if (newMsg.parent_message_id) {
            // It's a thread reply — update parent's reply count
            setMessages((prev) =>
              prev.map((m) =>
                m.id === newMsg.parent_message_id
                  ? { ...m, reply_count: (m.reply_count || 0) + 1 }
                  : m
              )
            )
          } else {
            // Top-level message
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, enrichedMsg]
            })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const updated = payload.new as Message
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          )
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string }
          setMessages((prev) => prev.filter((m) => m.id !== deleted.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, isAdmin])

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || messages.length === 0) return

    const supabase = supabaseRef.current
    const oldestMessage = messages[0]

    let query = supabase
      .from("messages")
      .select("*, profiles(*)")
      .eq("channel_id", channelId)
      .is("parent_message_id", null)
      .lt("created_at", oldestMessage.created_at)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE)

    if (!isAdmin) query = query.eq("is_hidden", false)

    const { data } = await query

    if (!data) return

    setHasMore(data.length === PAGE_SIZE)
    setMessages((prev) => [...data.reverse(), ...prev])
  }, [channelId, hasMore, isLoading, messages, isAdmin])

  // Send message
  const sendMessage = useCallback(
    async (content: string, attachments: Message["attachments"] = []) => {
      const supabase = supabaseRef.current
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("messages").insert({
        channel_id: channelId,
        user_id: user.id,
        content,
        attachments,
      })

      if (error) {
        console.error("Failed to send message:", error)
        throw error
      }
    },
    [channelId]
  )

  // Hide/unhide message (admin only)
  const toggleHideMessage = useCallback(
    async (messageId: string, hide: boolean) => {
      const supabase = supabaseRef.current
      const { error } = await supabase
        .from("messages")
        .update({ is_hidden: hide })
        .eq("id", messageId)

      if (error) {
        console.error("Failed to hide message:", error)
        throw error
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_hidden: hide } : m))
      )
    },
    []
  )

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
    sendMessage,
    toggleHideMessage,
    setMessages,
  }
}
