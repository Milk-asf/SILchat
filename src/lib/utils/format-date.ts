import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns"

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString)

  if (isToday(date)) return format(date, "h:mm a")
  if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`
  return format(date, "MMM d, h:mm a")
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

export function formatDateDivider(dateString: string): string {
  const date = new Date(dateString)

  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "EEEE, MMMM d")
}
