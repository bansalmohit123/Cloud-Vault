"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  FolderPlus, 
  Upload, 
  Grid2x2, 
  List 
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { uploadFile } from "@/lib/upload"
import { useSubscription } from "../subscription-provider"

interface FileToolbarProps {
  currentPath: string;
  onCreateFolder: (name: string) => void;
  onFileUploaded: (file: any) => void;
}

export function FileToolbar({ currentPath, onCreateFolder, onFileUploaded }: FileToolbarProps) {
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { isPremium } = useSubscription()

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName("")
      setIsNewFolderOpen(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      try {
        if (!isPremium && e.target.files[0].size > 5 * 1024 * 1024) {
          toast({
            title: "Subscription Required",
            description: "Please subscribe to upload files larger than 5 MB",
            variant: "default",
          });
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }
        try {
          const fileRecord = await uploadFile(e.target.files[0], currentPath);
          onFileUploaded(fileRecord);
          toast({
            title: "Success",
            description: "File uploaded successfully",
          });
          } catch (error) {
          if (error instanceof Error && error.message === "Subscription required to upload files larger than 1 GB") {
            toast({
            title: "Subscription Required",
            description: "Please subscribe to upload files larger than 1 GB",
            variant: "default",
            });
          } 
          else if(error instanceof Error && error.message === "Upload limit reached for today") {
            toast({
            title: "Upload Limit Reached",
            description: "You have reached the upload limit for today",
            variant: "default",
            });
          }
          else {
            console.error("Upload error:", error);
            toast({
            title: "Error",
            description: "Failed to upload file",
            variant: "destructive",
            });
          }
          }
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsNewFolderOpen(true)}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Select defaultValue="grid">
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">
              <div className="flex items-center">
                <Grid2x2 className="h-4 w-4 mr-2" />
                Grid
              </div>
            </SelectItem>
            <SelectItem value="list">
              <div className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                List
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}