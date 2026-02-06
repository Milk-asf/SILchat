"use client"

interface TypingUser {
  userId: string
  username: string
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return <div className="h-5 px-6" />

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0].username} is typing`
      : typingUsers.length === 2
        ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing`
        : `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing`

  return (
    <div className="flex h-5 items-center gap-2 px-6">
      <div className="flex gap-0.5">
        <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-gray-500">{text}</span>
    </div>
  )
}
