"use client"

import { useAuthGuard } from "@/lib/auth"
import { FileExplorer } from "@/components/file-explorer"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Home() {
  const { status } = useAuthGuard()

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FileExplorer />
    </div>
  )
}