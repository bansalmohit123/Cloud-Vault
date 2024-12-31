"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudIcon } from "lucide-react"

export function AuthForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CloudIcon className="h-12 w-12" />
        </div>
        <CardTitle className="text-2xl">Welcome to CloudDrive</CardTitle>
        <CardDescription>
          Sign in to access your cloud storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          onClick={() => signIn("google")}
        >
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  )
}