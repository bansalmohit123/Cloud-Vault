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
  
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      async function fetchData() {
        const userData = await usermodel(session?.user?.email || '')
        setUser(userData)

        const subscriptionData = await SubcriptionModel()
        setSubscription(subscriptionData)
      }
      fetchData()
    }
  }, [session])

  if (!mounted || !user || !subscription) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
        </div>
    );
  }

  const filesCount = user.filesCount
  const memoryUsage = (user.uploads / (1024 * 1024 * 1024)).toFixed(5) // GB
  const maxMemory = isPremium ? 50 : 1 // GB

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24 ring-4 ring-white">
            <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
            <AvatarFallback className="text-2xl">{session?.user?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold text-white">{session?.user?.name}</h1>
            <p className="text-xl text-white opacity-80">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Files</CardTitle>
            <FileIcon className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{filesCount}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Total files in your CloudDrive
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Subscription</CardTitle>
            <CreditCard className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{isPremium ? 'Premium' : 'Free'}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Your current plan
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Storage Used</CardTitle>
            <HardDrive className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{memoryUsage} GB</div>
            <p className="text-sm text-muted-foreground mt-2">
              of {maxMemory} GB used
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
