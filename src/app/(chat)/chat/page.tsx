import { MessageSquare } from "lucide-react"

export default function ChatDefaultPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <h2 className="text-sm font-medium text-gray-900">
          Select a channel
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a channel from the sidebar to start chatting
        </p>
      </div>
    </div>
  )
}
