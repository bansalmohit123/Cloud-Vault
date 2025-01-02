"use client"

import { useDrag } from 'react-dnd'
import { File, Folder } from 'lucide-react'

interface DraggableItemProps {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string[]
}

export function DraggableItem({ id, name, type, path }: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'FILE_OR_FOLDER',
    item: { id, name, type, sourcePath: path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={dragRef as any} // Type assertion needed due to React-DnD typing limitations
      className={`flex items-center space-x-2 p-2 rounded cursor-move
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:bg-accent`}
    >
      {type === 'folder' ? (
        <Folder className="h-5 w-5 text-blue-500" />
      ) : (
        <File className="h-5 w-5 text-gray-500" />
      )}
      <span className="truncate">{name}</span>
    </div>
  )
}