import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getWorkspace } from "@/lib/workspace"
import { ChatProvider } from "@/components/providers/chat-provider"
import { Sidebar } from "@/components/sidebar/sidebar"
import { WorkspaceTheme } from "@/components/providers/workspace-theme"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const [{ data: profile }, workspace, { data: channels }, { data: memberships }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      getWorkspace(),
      supabase.from("channels").select("*").order("created_at", { ascending: true }),
      supabase.from("channel_members").select("channel_id").eq("user_id", user.id),
    ])

  if (!profile) redirect("/login")

  const memberChannelIds = new Set(
    memberships?.map((m) => m.channel_id) ?? []
  )

  return (
    <ChatProvider
      initialProfile={profile}
      initialWorkspace={workspace}
      initialChannels={channels ?? []}
      initialMemberChannelIds={Array.from(memberChannelIds)}
    >
      <WorkspaceTheme />
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </ChatProvider>
  )
}
