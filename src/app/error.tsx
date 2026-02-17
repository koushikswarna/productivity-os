"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
