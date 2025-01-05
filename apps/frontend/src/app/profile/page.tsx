"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileIcon, CreditCard, HardDrive } from 'lucide-react'
import { usermodel } from "@/lib/upload"
import { SubcriptionModel } from "@/lib/subscription"
import { useSubscription } from "@/components/subscription-provider"

export default function ProfilePage() {
  const { data: session } = useSession()
  const { isPremium } = useSubscription()
  
  // Always define hooks at the top level
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)

  // Ensure hooks are not conditional
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      async function fetchData() {
        const userData = await usermodel(session?.user?.email||'')
        setUser(userData)

        const subscriptionData = await SubcriptionModel()
        setSubscription(subscriptionData)
      }
      fetchData()
    }
  }, [session])

  // Handle loading states
  if (!mounted || !user || !subscription) {
    return <div>Loading...</div>
  }

  // Mock data for files, subscription, and memory usage
  const filesCount =user.filesCount // 10
  const memoryUsage = user.uploads // GB
  const maxMemory = isPremium ? 100 : 1 // GB

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
          <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
          <p className="text-muted-foreground">{session?.user?.email}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Files
            </CardTitle>
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filesCount}</div>
            <p className="text-xs text-muted-foreground">
              Total files in your CloudDrive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isPremium ? 'Premium' : 'Free'}</div>
            <p className="text-xs text-muted-foreground">
              Your current plan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Storage Used
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryUsage} GB</div>
            <p className="text-xs text-muted-foreground mt-2">
              {memoryUsage} GB of {maxMemory} GB used
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}