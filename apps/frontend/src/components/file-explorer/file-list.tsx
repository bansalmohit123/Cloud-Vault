"use client"

import {
  File,
  Folder,
  MoreVertical,
  Download,
  Trash,
  Share,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface File {
  id: string
  name: string
  type: "file" | "folder"
}

interface FileListProps {
  currentPath: string[]
  files: File[]
  onNavigate: (path: string[]) => void
  onBack: () => void
}

export function FileList({ currentPath, files, onNavigate, onBack }: FileListProps) {
  const isRoot = currentPath.length === 0

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        {!isRoot && (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        )}
        <span className="text-sm text-muted-foreground truncate">
          Current Path: {currentPath.join(" / ") || "/"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((item) => (
          <div
            key={item.id}
            className="group relative bg-card hover:bg-accent rounded-lg p-4 cursor-pointer"
            onClick={() => {
              if (item.type === "folder") {
                onNavigate([...currentPath, item.name])
              }
            }}
          >
            <div className="flex items-center space-x-3">
              {item.type === "folder" ? (
                <Folder className="h-8 w-8 text-blue-500" />
              ) : (
                <File className="h-8 w-8 text-gray-500" />
              )}
              <span className="flex-1 truncate">{item.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
