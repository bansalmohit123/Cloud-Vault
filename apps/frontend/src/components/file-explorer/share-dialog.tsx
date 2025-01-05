'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Copy, Check } from 'lucide-react'
import { generatePresignedURLget } from '@/lib/api'
import { cn } from "@/lib/utils"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  fileName: string
  folderId: string | null
}

export function ShareDialog({ isOpen, onClose, fileUrl, fileName, folderId }: ShareDialogProps) {
  const [shareType, setShareType] = useState<'public' | 'expiry'>('expiry')
  const [expiryHours, setExpiryHours] = useState('24')
  const [link, setLink] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const handleShare = async () => {
    if (shareType === 'public') {
      setLink(fileUrl)
    } else {
      const presignedUrl = await generatePresignedURLget(fileName, folderId as string, parseInt(expiryHours) * 60 * 60)
      setLink(presignedUrl)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>Choose how you want to share this file.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Alert variant="warning">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Recommendation</AlertTitle>
            <AlertDescription>
              Setting an expiry time is always better for security. We've set this as the default option.
            </AlertDescription>
          </Alert>
          <RadioGroup defaultValue="expiry" onValueChange={(value) => setShareType(value as 'public' | 'expiry')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expiry" id="expiry" />
              <Label htmlFor="expiry">Set expiry (Recommended)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public">Public (No expiry)</Label>
            </div>
          </RadioGroup>
          {shareType === 'expiry' && (
            <div className="flex items-center space-x-2">
              <Input 
                type="number" 
                value={expiryHours} 
                onChange={(e) => setExpiryHours(e.target.value)}
                className="w-20"
              />
              <Label>hours</Label>
            </div>
          )}
          {link && (
            <div className="space-y-2">
              <Label>Generated Link</Label>
              <div className="flex">
                <Input 
                  value={link} 
                  readOnly 
                  className="rounded-r-none"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className={cn(
                    "rounded-l-none",
                    isCopied && "bg-green-500 text-white hover:bg-green-600"
                  )}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleShare}>Generate Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

