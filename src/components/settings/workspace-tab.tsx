"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useChatContext } from "@/components/providers/chat-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, X, Loader2, MessageSquare } from "lucide-react"

const PRESET_COLORS = [
  { label: "Slate", primary: "#111827", accent: "#4F46E5" },
  { label: "Ocean", primary: "#0C4A6E", accent: "#0EA5E9" },
  { label: "Forest", primary: "#14532D", accent: "#22C55E" },
  { label: "Wine", primary: "#4C0519", accent: "#F43F5E" },
  { label: "Sunset", primary: "#7C2D12", accent: "#F97316" },
  { label: "Purple", primary: "#3B0764", accent: "#A855F7" },
]

export function WorkspaceTab() {
  const { workspace, setWorkspace } = useChatContext()
  const [name, setName] = useState(workspace.name)
  const [primaryColor, setPrimaryColor] = useState(workspace.primary_color)
  const [accentColor, setAccentColor] = useState(workspace.accent_color)
  const [logoPreview, setLogoPreview] = useState<string | null>(
    workspace.logo_url
  )
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB")
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Workspace name is required")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    let logoUrl = workspace.logo_url

    // Upload new logo if selected
    if (logoFile) {
      setIsUploadingLogo(true)
      const ext = logoFile.name.split(".").pop()
      const path = `logo-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("workspace-assets")
        .upload(path, logoFile, { upsert: true })

      if (uploadError) {
        toast.error("Failed to upload logo")
        setIsSaving(false)
        setIsUploadingLogo(false)
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("workspace-assets").getPublicUrl(path)
      logoUrl = publicUrl
      setIsUploadingLogo(false)
    } else if (!logoPreview && workspace.logo_url) {
      // Logo was removed
      logoUrl = null
    }

    const { error } = await supabase
      .from("workspace")
      .update({
        name: name.trim(),
        logo_url: logoUrl,
        primary_color: primaryColor,
        accent_color: accentColor,
      })
      .eq("id", workspace.id)

    if (error) {
      toast.error("Failed to save workspace settings")
      setIsSaving(false)
      return
    }

    setWorkspace({
      ...workspace,
      name: name.trim(),
      logo_url: logoUrl,
      primary_color: primaryColor,
      accent_color: accentColor,
    })
    setLogoFile(null)
    toast.success("Workspace settings saved")
    setIsSaving(false)
  }

  const hasChanges =
    name !== workspace.name ||
    primaryColor !== workspace.primary_color ||
    accentColor !== workspace.accent_color ||
    logoFile !== null ||
    (!logoPreview && workspace.logo_url !== null)

  return (
    <div className="space-y-8">
      {/* Workspace name */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Workspace name</h3>
          <p className="mt-1 text-xs text-gray-500">
            This appears in the sidebar and page titles
          </p>
        </div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 max-w-sm text-sm"
          placeholder="My workspace"
        />
      </div>

      {/* Logo */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Logo</h3>
          <p className="mt-1 text-xs text-gray-500">
            Square image, max 2MB. PNG, JPG, SVG, or WebP.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo preview"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleLogoSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 gap-1.5 text-xs"
            >
              {isUploadingLogo ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Upload logo
            </Button>
            {logoPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="h-8 gap-1.5 text-xs text-gray-400 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Theme</h3>
          <p className="mt-1 text-xs text-gray-500">
            Choose a color preset or customize your own
          </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PRESET_COLORS.map((preset) => {
            const isSelected =
              preset.primary === primaryColor && preset.accent === accentColor
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setPrimaryColor(preset.primary)
                  setAccentColor(preset.accent)
                }}
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 transition-colors ${
                  isSelected
                    ? "border-gray-900 bg-gray-50"
                    : "border-transparent hover:border-gray-200"
                }`}
                aria-label={`${preset.label} theme`}
              >
                <div className="flex gap-1">
                  <div
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-500">
                  {preset.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Custom colors */}
        <div className="flex gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Primary</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-gray-200"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-8 w-24 font-mono text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Accent</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-gray-200"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-8 w-24 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Preview</Label>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: primaryColor }}>
                {name || "Workspace"}
              </p>
              <p className="text-xs" style={{ color: accentColor }}>
                accent color preview
              </p>
            </div>
            <div
              className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              Button
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          size="sm"
          className="gap-1.5"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          Save changes
        </Button>
        {hasChanges && (
          <p className="text-xs text-gray-400">You have unsaved changes</p>
        )}
      </div>
    </div>
  )
}
