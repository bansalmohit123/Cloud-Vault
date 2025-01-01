import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuthGuard(redirectTo: string = "/auth") {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.replace(redirectTo)
    }
  }, [session, status, router, redirectTo])

  return { session, status }
}

export function useRedirectIfAuthenticated(redirectTo: string = "/") {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (session) {
      router.replace(redirectTo)
    }
  }, [session, status, router, redirectTo])

  return { session, status }
}