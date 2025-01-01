"use client"

import { createContext, useContext, ReactNode } from "react"

interface SubscriptionContextType {
  isPremium: boolean
}

const SubscriptionContext = createContext<SubscriptionContextType>({ isPremium: false })

export function SubscriptionProvider({ 
  children,
  initialPremiumStatus
}: { 
  children: ReactNode
  initialPremiumStatus: boolean 
}) {
  return (
    <SubscriptionContext.Provider value={{ isPremium: initialPremiumStatus }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  return useContext(SubscriptionContext)
}