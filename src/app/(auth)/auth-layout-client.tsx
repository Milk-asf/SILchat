"use client"

import { WorkspaceThemeStatic } from "@/components/providers/workspace-theme"

export function AuthLayoutClient({
  children,
  primaryColor,
  accentColor,
}: {
  children: React.ReactNode
  primaryColor: string
  accentColor: string
}) {
  return (
    <>
      <WorkspaceThemeStatic
        primaryColor={primaryColor}
        accentColor={accentColor}
      />
      {children}
    </>
  )
}
