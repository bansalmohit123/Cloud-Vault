"use client"

import { FolderItem } from './folder-item'
import { DraggableItem } from './draggable-item'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface File {
  id: string
  name: string
  type: 'file' | 'folder'
}

interface FileListProps {
  currentPath: string[]
  files: File[]
  onNavigate: (path: string[]) => void
  onBack: () => void
  onMove: (sourceId: string, targetPath: string[], sourcePath: string[]) => void
}

export function FileList({ 
  currentPath, 
  files, 
  onNavigate, 
  onBack,
  onMove 
}: FileListProps) {
  const { toast } = useToast()
  const isRoot = currentPath.length === 0

  const handleMove = async (sourceId: string, targetPath: string[], sourcePath: string[]) => {
    try {
      const response = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, targetPath })
      })

      if (!response.ok) throw new Error('Move failed')

      onMove(sourceId, targetPath, sourcePath)
      
      toast({
        title: 'Success',
        description: 'Item moved successfully',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to move item',
        variant: 'destructive',
      })
    }
  }

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
            className="group relative bg-card rounded-lg"
          >
            {item.type === 'folder' ? (
              <FolderItem
                id={item.id}
                name={item.name}
                path={currentPath}
                onNavigate={() => onNavigate([...currentPath, item.name])}
                onMove={handleMove}
              />
            ) : (
              <DraggableItem
                id={item.id}
                name={item.name}
                type="file"
                path={currentPath}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}