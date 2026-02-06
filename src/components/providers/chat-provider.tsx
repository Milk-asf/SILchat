"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { Profile, Channel, Message, Workspace } from "@/lib/types"

interface ChatContextValue {
  profile: Profile
  workspace: Workspace
  channels: Channel[]
  memberChannelIds: string[]
  activeThreadMessage: Message | null
  setWorkspace: (workspace: Workspace) => void
  setChannels: (channels: Channel[]) => void
  addChannel: (channel: Channel) => void
  removeChannel: (channelId: string) => void
  joinChannel: (channelId: string) => void
  leaveChannel: (channelId: string) => void
  openThread: (message: Message) => void
  closeThread: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context)
    throw new Error("useChatContext must be used within ChatProvider")
  return context
}

export function ChatProvider({
  children,
  initialProfile,
  initialWorkspace,
  initialChannels,
  initialMemberChannelIds,
}: {
  children: ReactNode
  initialProfile: Profile
  initialWorkspace: Workspace
  initialChannels: Channel[]
  initialMemberChannelIds: string[]
}) {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace)
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [memberChannelIds, setMemberChannelIds] = useState<string[]>(
    initialMemberChannelIds
  )
  const [activeThreadMessage, setActiveThreadMessage] =
    useState<Message | null>(null)

  const addChannel = useCallback((channel: Channel) => {
    setChannels((prev) => [...prev, channel])
    setMemberChannelIds((prev) => [...prev, channel.id])
  }, [])

  const removeChannel = useCallback((channelId: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== channelId))
    setMemberChannelIds((prev) => prev.filter((id) => id !== channelId))
  }, [])

  const joinChannel = useCallback((channelId: string) => {
    setMemberChannelIds((prev) =>
      prev.includes(channelId) ? prev : [...prev, channelId]
    )
  }, [])

  const leaveChannel = useCallback((channelId: string) => {
    setMemberChannelIds((prev) => prev.filter((id) => id !== channelId))
  }, [])

  const openThread = useCallback((message: Message) => {
    setActiveThreadMessage(message)
  }, [])

  const closeThread = useCallback(() => {
    setActiveThreadMessage(null)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        profile: initialProfile,
        workspace,
        setWorkspace,
        channels,
        memberChannelIds,
        activeThreadMessage,
        setChannels,
        addChannel,
        removeChannel,
        joinChannel,
        leaveChannel,
        openThread,
        closeThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
