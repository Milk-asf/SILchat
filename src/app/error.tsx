"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        <h2 className="text-sm font-medium text-gray-900">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          An unexpected error occurred.
        </p>
        <Button
          onClick={reset}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}
