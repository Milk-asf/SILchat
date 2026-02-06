"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, X, FileText, Loader2 } from "lucide-react"
import { uploadFile, isImageFile, formatFileSize } from "@/lib/utils/file-upload"
import { toast } from "sonner"
import type { Attachment } from "@/lib/types"

interface MessageInputProps {
  onSend: (content: string, attachments?: Attachment[]) => Promise<void>
  onTyping: () => void
  onStopTyping: () => void
  channelName: string
  userId: string
  placeholder?: string
}

export function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  channelName,
  userId,
  placeholder,
}: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(async () => {
    const trimmed = content.trim()
    if (!trimmed && pendingFiles.length === 0) return

    setIsSending(true)
    try {
      let attachments: Attachment[] = []

      if (pendingFiles.length > 0) {
        setIsUploading(true)
        attachments = await Promise.all(
          pendingFiles.map((f) => uploadFile(f, userId))
        )
        setIsUploading(false)
      }

      await onSend(trimmed || " ", attachments.length > 0 ? attachments : undefined)
      setContent("")
      setPendingFiles([])
      onStopTyping()
      textareaRef.current?.focus()
    } catch {
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
      setIsUploading(false)
    }
  }, [content, pendingFiles, onSend, onStopTyping, userId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    onTyping()

    // Auto-resize textarea
    const target = e.target
    target.style.height = "auto"
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 10MB limit`)
        return false
      }
      return true
    })
    setPendingFiles((prev) => [...prev, ...validFiles])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024)
    setPendingFiles((prev) => [...prev, ...validFiles])
  }

  return (
    <div
      className="border-t border-gray-200 px-6 py-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Pending file previews */}
      {pendingFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1"
            >
              {isImageFile(file.type) ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <FileText className="h-4 w-4 text-gray-400" />
              )}
              <div className="max-w-[120px]">
                <p className="truncate text-xs font-medium text-gray-700">
                  {file.name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => removePendingFile(i)}
                className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                aria-label="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mb-1 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.txt,.zip,.doc,.docx"
        />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Message #${channelName}`}
          rows={1}
          className="max-h-40 flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
          style={{
            borderColor: undefined,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--workspace-accent-medium, rgba(79,70,229,0.15))"
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = ""
          }}
          aria-label="Message input"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={
            isSending ||
            isUploading ||
            (!content.trim() && pendingFiles.length === 0)
          }
          className="mb-0.5 h-8 w-8 p-0"
          style={{ backgroundColor: "var(--workspace-accent, #4F46E5)" }}
          aria-label="Send message"
        >
          {isSending || isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
