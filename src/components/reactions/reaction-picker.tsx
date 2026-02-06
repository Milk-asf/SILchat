"use client"

const COMMON_EMOJIS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🎉",
  "🔥",
  "👀",
  "✅",
  "👏",
  "🙌",
  "💯",
]

interface ReactionPickerProps {
  onSelect: (emoji: string) => void
}

export function ReactionPicker({ onSelect }: ReactionPickerProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="rounded-md p-1 text-base transition-transform hover:scale-125 hover:bg-gray-100"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
