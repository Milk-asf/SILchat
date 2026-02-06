import { getWorkspace } from "@/lib/workspace"
import { AuthLayoutClient } from "./auth-layout-client"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const workspace = await getWorkspace()

  return (
    <AuthLayoutClient
      primaryColor={workspace.primary_color}
      accentColor={workspace.accent_color}
    >
      {children}
    </AuthLayoutClient>
  )
}
