import { createClient } from "@/lib/supabase/client"
import type { Attachment } from "@/lib/types"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadFile(
  file: File,
  userId: string
): Promise<Attachment> {
  if (file.size > MAX_FILE_SIZE)
    throw new Error("File size exceeds 10MB limit")

  const supabase = createClient()
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { error } = await supabase.storage
    .from("chat-attachments")
    .upload(fileName, file)

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: urlData } = supabase.storage
    .from("chat-attachments")
    .getPublicUrl(fileName)

  return {
    name: file.name,
    url: urlData.publicUrl,
    type: file.type,
    size: file.size,
  }
}

export function isImageFile(type: string): boolean {
  return type.startsWith("image/")
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
