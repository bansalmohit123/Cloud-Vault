"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"
import { CloudIcon, User } from "lucide-react"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <CloudIcon className="h-6 w-6" />
          <span className="font-bold text-xl">CloudDrive</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button onClick={() => window.location.href = '/premium'}>Go Premium</Button>
          <ModeToggle />
          {session ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button onClick={() => signOut()}>Sign Out</Button>
            </>
          ) : (
            <Button onClick={() => signIn("google")}>Sign In</Button>
          )}
        </div>
      </div>
    </header>
  )
}