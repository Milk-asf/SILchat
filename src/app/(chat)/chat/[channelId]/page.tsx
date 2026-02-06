import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChannelView } from "@/components/messages/channel-view"

interface ChannelPageProps {
  params: Promise<{ channelId: string }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { channelId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Verify channel exists and user is a member
  const { data: membership } = await supabase
    .from("channel_members")
    .select("id")
    .eq("channel_id", channelId)
    .eq("user_id", user.id)
    .single()

  if (!membership) redirect("/chat")

  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .single()

  if (!channel) redirect("/chat")

  return <ChannelView channel={channel} />
}
