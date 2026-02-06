import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsContent } from "@/components/settings/settings-content"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "super_admin") redirect("/chat")

  return <SettingsContent />
}
