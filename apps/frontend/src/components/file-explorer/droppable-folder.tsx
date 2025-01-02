"use client"

import { useDrop } from 'react-dnd'
import { Folder } from 'lucide-react'

interface DroppableFolderProps {
  id: string
  name: string
  path: string[]
  onMove: (sourceId: string, targetPath: string[], sourcePath: string[]) => void
}

export function DroppableFolder({ id, name, path, onMove }: DroppableFolderProps) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'FILE_OR_FOLDER',
    drop: (item: { id: string; sourcePath: string[] }) => {
      onMove(item.id, path, item.sourcePath)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={dropRef as any} // Type assertion needed due to React-DnD typing limitations
      className={`p-2 rounded cursor-pointer
        ${isOver ? 'bg-primary/20' : 'hover:bg-accent'}`}
    >
      <div className="flex items-center space-x-2">
        <Folder className="h-5 w-5 text-blue-500" />
        <span className="truncate">{name}</span>
      </div>
    </div>
  )
}