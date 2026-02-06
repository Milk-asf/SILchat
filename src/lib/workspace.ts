import { createClient } from "@/lib/supabase/server"
import type { Workspace } from "@/lib/types"

const DEFAULT_WORKSPACE: Workspace = {
  id: "",
  name: "SILchat",
  logo_url: null,
  primary_color: "#111827",
  accent_color: "#4F46E5",
  billing_plan: "free",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export async function getWorkspace(): Promise<Workspace> {
  const supabase = await createClient()
  const { data } = await supabase.from("workspace").select("*").single()
  return data ?? DEFAULT_WORKSPACE
}
