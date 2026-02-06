import Image from "next/image"
import { MessageSquare } from "lucide-react"
import type { Workspace } from "@/lib/types"

interface WorkspaceBrandingProps {
  workspace: Workspace
  size?: "sm" | "md"
}

export function WorkspaceBranding({
  workspace,
  size = "md",
}: WorkspaceBrandingProps) {
  const iconSize = size === "md" ? "h-12 w-12" : "h-9 w-9"
  const iconInner = size === "md" ? "h-6 w-6" : "h-4 w-4"
  const nameSize = size === "md" ? "text-lg font-semibold" : "text-sm font-semibold"

  return (
    <div className="flex flex-col items-center gap-3">
      {workspace.logo_url ? (
        <Image
          src={workspace.logo_url}
          alt={workspace.name}
          width={size === "md" ? 48 : 36}
          height={size === "md" ? 48 : 36}
          className={`${iconSize} rounded-xl object-cover`}
        />
      ) : (
        <div
          className={`flex ${iconSize} items-center justify-center rounded-xl`}
          style={{ backgroundColor: workspace.primary_color }}
        >
          <MessageSquare className={`${iconInner} text-white`} />
        </div>
      )}
      <span className={`${nameSize} text-gray-900`}>{workspace.name}</span>
    </div>
  )
}
