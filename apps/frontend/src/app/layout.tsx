import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth-provider'
import { SubscriptionProvider } from '@/components/subscription-provider'
import { Header } from '@/components/header'
import { getSubscriptionStatus } from '@/lib/subscription'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CloudDrive - Your Personal Cloud Storage',
  description: 'Secure cloud storage for all your files',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isPremium = await getSubscriptionStatus()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>

        <AuthProvider>
          <SubscriptionProvider initialPremiumStatus={isPremium}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="min-h-screen bg-background">
                <Header />
                <main>{children}</main>
                <Toaster />
              </div>
            </ThemeProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}