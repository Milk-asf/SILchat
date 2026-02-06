"use client"

import { useEffect } from "react"
import { useChatContext } from "./chat-provider"

export function WorkspaceTheme() {
  const { workspace } = useChatContext()

  useEffect(() => {
    applyThemeColors(workspace.primary_color, workspace.accent_color)
  }, [workspace.primary_color, workspace.accent_color])

  return null
}

/** Standalone theme injector for pages outside ChatProvider (e.g. auth) */
export function WorkspaceThemeStatic({
  primaryColor,
  accentColor,
}: {
  primaryColor: string
  accentColor: string
}) {
  useEffect(() => {
    applyThemeColors(primaryColor, accentColor)
  }, [primaryColor, accentColor])

  return null
}

function applyThemeColors(primary: string, accent: string) {
  const root = document.documentElement
  root.style.setProperty("--workspace-primary", primary)
  root.style.setProperty("--workspace-accent", accent)

  // Convert hex to rgb components for opacity variants
  const accentRgb = hexToRgb(accent)
  if (accentRgb) {
    root.style.setProperty(
      "--workspace-accent-light",
      `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.08)`
    )
    root.style.setProperty(
      "--workspace-accent-medium",
      `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.15)`
    )
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}
