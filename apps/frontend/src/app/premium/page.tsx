"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useSubscription } from "@/components/subscription-provider"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function PremiumPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { isPremium } = useSubscription()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  if (isPremium) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>You're a Premium Member!</CardTitle>
            <CardDescription>Enjoy all the premium features</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Premium</CardTitle>
            <CardDescription>Get access to premium features</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">✓ Unlimited storage</li>
              <li className="flex items-center">✓ Priority support</li>
              <li className="flex items-center">✓ Advanced file sharing</li>
              <li className="flex items-center">✓ Team collaboration</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubscribe} 
              disabled={loading || !session}
              className="w-full"
            >
              {loading ? "Processing..." : "Upgrade Now - $9.99/month"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}