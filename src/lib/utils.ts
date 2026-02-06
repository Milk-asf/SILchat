import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Profile } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Admin-level access: can manage channels, messages, members */
export function hasAdminAccess(profile: Profile): boolean {
  return profile.role === "admin" || profile.role === "super_admin"
}

/** Super admin access: can manage workspace settings, billing, invitations, roles */
export function hasSuperAdminAccess(profile: Profile): boolean {
  return profile.role === "super_admin"
}
