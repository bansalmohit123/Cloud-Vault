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
import { uploadFile } from "@/lib/upload"
import {
  ToastProvider,
  Toast,
  ToastAction,
  ToastViewport,
} from "@/components/ui/toast"

interface FileToolbarProps {
  onCreateFolder: (name: string) => void
}

export function FileToolbar({ onCreateFolder }: FileToolbarProps) {
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadToastId, setUploadToastId] = useState<string | null>(null)

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setIsNewFolderOpen(false)  // Close the dialog after creating folder
    } else {
      alert("Please enter a valid folder name.")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Show loading toast when upload starts
      const toastId = `upload-${Date.now()}`;
      setUploadToastId(toastId);

      // Start uploading
      setIsUploading(true);
      uploadFile(e.target.files[0])
        .then(() => {
          // Show success toast when upload is complete
          setUploadToastId(null);
          alert("File uploaded successfully!");
        })
        .catch((error) => {
          // Handle error if upload fails
          console.error("Upload error:", error);
          alert("Upload failed.");
        })
        .finally(() => {
          setIsUploading(false);
        });
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
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
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            multiple
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
                handleCreateFolder();
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

      {/* ToastProvider for toast notifications */}
      <ToastProvider>
        {uploadToastId && (
          <Toast id={uploadToastId} duration={0}>
            <div className="flex items-center">
              <div className="mr-2">Uploading...</div>
              {isUploading && <span className="animate-pulse">Please wait...</span>}
            </div>
            <ToastAction altText="Cancel upload">Cancel</ToastAction>
          </Toast>
        )}
        {!isUploading && uploadToastId && (
          <Toast id={uploadToastId} variant="default" duration={5000}>
            <div className="flex items-center">
              <div className="mr-2">Upload Successful!</div>
            </div>
            <ToastAction altText="Close upload success">Close</ToastAction>
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>
    </>
  )
}
