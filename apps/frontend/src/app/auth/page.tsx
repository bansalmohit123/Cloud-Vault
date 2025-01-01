"use client"

import { useRedirectIfAuthenticated } from "@/lib/auth"
import { AuthForm } from "@/components/auth-form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AuthPage() {
  const { status } = useRedirectIfAuthenticated()
  
  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-73px)]">
      <AuthForm />
    </div>
  )
}