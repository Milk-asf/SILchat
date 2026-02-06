"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Message } from "@/lib/types"

export function useThread(parentMessageId: string) {
  const [replies, setReplies] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current
    setIsLoading(true)

    const fetchReplies = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(
          "*, profiles(*)"
        )
        .eq("parent_message_id", parentMessageId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Failed to fetch replies:", error)
        setIsLoading(false)
        return
      }

      setReplies(data || [])
      setIsLoading(false)
    }

    fetchReplies()
  }, [parentMessageId])

  // Subscribe to realtime for thread replies
  useEffect(() => {
    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`thread:${parentMessageId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `parent_message_id=eq.${parentMessageId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMsg.user_id)
            .single()

          const enrichedMsg: Message = { ...newMsg, profiles: profile ?? undefined }

          setReplies((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, enrichedMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [parentMessageId])

  const sendReply = useCallback(
    async (content: string, channelId: string, attachments: Message["attachments"] = []) => {
      const supabase = supabaseRef.current
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("messages").insert({
        channel_id: channelId,
        user_id: user.id,
        parent_message_id: parentMessageId,
        content,
        attachments,
      })

      if (error) {
        console.error("Failed to send reply:", error)
        throw error
      }
    },
    [parentMessageId]
  )

  return { replies, isLoading, sendReply }
}
