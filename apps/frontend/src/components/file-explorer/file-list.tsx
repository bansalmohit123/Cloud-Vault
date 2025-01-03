"use client"

import { FolderItem } from './folder-item'
import { DraggableItem } from './draggable-item'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { moveItem } from "@/lib/folder"

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
  onMove: (sourceId: string, targetPath: string[], srcPath : string[]) => void
}

export function FileList({ 
  currentPath,
  files, 
  onNavigate, 
  onBack, 
  onMove 
}: FileListProps) {
  // console.log('currentPath', currentPath)
  // console.log('files', files)
  const { toast } = useToast()
  const isRoot = currentPath.length === 0

  const handleMove = async (
    sourceId: string,
    targetId: string,
    srcPath: string[],
    destPath: string[]
  ) => {
    console.log('sourceId', sourceId)
    console.log('targetId', targetId)
    console.log('srcPath', srcPath)
    console.log('destPath', destPath)
  
    try {
      // Call moveItem with only the IDs
      try{
      const response = await moveItem(sourceId, targetId)
      }catch(error){
        console.error(error)
        toast({
          title: 'Error',
          description: 'Failed to move item',
          variant: 'destructive',
        })
      }
  
      // Call onMove with all required parameters
      onMove(sourceId, destPath, srcPath)
      
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
                onMove={(sourceId) => handleMove(sourceId, item.id,currentPath, [...currentPath, item.name])}
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
