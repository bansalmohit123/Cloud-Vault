'use client';
import { createContext, useContext, useState, ReactNode } from "react";

// Define the type of the context state
interface SubscriptionContextType {
  isPremium: boolean;
  setIsPremium: (status: boolean) => void;
}

// Create the context with default values
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  initialPremiumStatus: boolean;
  children: ReactNode;
}

// SubscriptionProvider component that will provide the context value
export const SubscriptionProvider = ({ initialPremiumStatus, children }: SubscriptionProviderProps) => {
  const [isPremium, setIsPremium] = useState(initialPremiumStatus);

  return (
    <SubscriptionContext.Provider value={{ isPremium, setIsPremium }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use the subscription context
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
