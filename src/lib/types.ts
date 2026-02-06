export interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  role: "super_admin" | "admin" | "member"
  created_at: string
}

export interface Channel {
  id: string
  name: string
  description: string
  created_by: string
  created_at: string
}

export interface ChannelMember {
  id: string
  channel_id: string
  user_id: string
  joined_at: string
}

export interface Message {
  id: string
  channel_id: string
  user_id: string
  parent_message_id: string | null
  content: string
  attachments: Attachment[]
  is_hidden: boolean
  created_at: string
  updated_at: string
  // Joined fields
  profiles?: Profile
  reply_count?: number
}

export interface Attachment {
  name: string
  url: string
  type: string
  size: number
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface ReactionGroup {
  emoji: string
  count: number
  user_ids: string[]
  hasReacted: boolean
}

export interface Workspace {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  accent_color: string
  billing_plan: "free" | "pro" | "enterprise"
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  email: string
  invited_by: string
  role: "super_admin" | "admin" | "member"
  status: "pending" | "accepted"
  created_at: string
}
