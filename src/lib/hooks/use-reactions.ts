"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { MessageReaction, ReactionGroup } from "@/lib/types"

export function useReactions(messageIds: string[], currentUserId: string) {
  const [reactionsMap, setReactionsMap] = useState<
    Record<string, MessageReaction[]>
  >({})
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    if (messageIds.length === 0) return

    const supabase = supabaseRef.current

    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from("message_reactions")
        .select("*")
        .in("message_id", messageIds)

      if (error) {
        console.error("Failed to fetch reactions:", error)
        return
      }

      const grouped: Record<string, MessageReaction[]> = {}
      data?.forEach((r) => {
        if (!grouped[r.message_id]) grouped[r.message_id] = []
        grouped[r.message_id].push(r)
      })
      setReactionsMap(grouped)
    }

    fetchReactions()
  }, [messageIds.join(",")])

  // Subscribe to reaction changes
  useEffect(() => {
    if (messageIds.length === 0) return

    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`reactions:${messageIds[0]}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const reaction = payload.new as MessageReaction
            if (!messageIds.includes(reaction.message_id)) return

            setReactionsMap((prev) => ({
              ...prev,
              [reaction.message_id]: [
                ...(prev[reaction.message_id] || []),
                reaction,
              ],
            }))
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string; message_id: string }
            setReactionsMap((prev) => ({
              ...prev,
              [deleted.message_id]: (
                prev[deleted.message_id] || []
              ).filter((r) => r.id !== deleted.id),
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [messageIds.join(",")])

  const getReactionGroups = useCallback(
    (messageId: string): ReactionGroup[] => {
      const reactions = reactionsMap[messageId] || []
      const groups: Record<string, ReactionGroup> = {}

      reactions.forEach((r) => {
        if (!groups[r.emoji]) {
          groups[r.emoji] = {
            emoji: r.emoji,
            count: 0,
            user_ids: [],
            hasReacted: false,
          }
        }
        groups[r.emoji].count++
        groups[r.emoji].user_ids.push(r.user_id)
        if (r.user_id === currentUserId) groups[r.emoji].hasReacted = true
      })

      return Object.values(groups)
    },
    [reactionsMap, currentUserId]
  )

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const supabase = supabaseRef.current
      const reactions = reactionsMap[messageId] || []
      const existing = reactions.find(
        (r) => r.emoji === emoji && r.user_id === currentUserId
      )

      if (existing) {
        await supabase
          .from("message_reactions")
          .delete()
          .eq("id", existing.id)
      } else {
        await supabase.from("message_reactions").insert({
          message_id: messageId,
          user_id: currentUserId,
          emoji,
        })
      }
    },
    [reactionsMap, currentUserId]
  )

  return { getReactionGroups, toggleReaction }
}
