"use client"

import { useDrag, useDrop } from 'react-dnd'
import { Folder } from 'lucide-react'

interface FolderItemProps {
  id: string
  name: string
  path: string[]
  onNavigate: () => void
  onMove: (sourceId: string, targetPath: string[], sourcePath: string[]) => void
}

export function FolderItem({ id, name, path, onNavigate, onMove }: FolderItemProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'FILE_OR_FOLDER',
    item: { id, name, type: 'folder', sourcePath: path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'FILE_OR_FOLDER',
    drop: (item: { id: string; sourcePath: string[] }) => {
      if (item.id !== id) { // Prevent dropping on itself
        onMove(item.id, [...path, name], item.sourcePath)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  // Combine drag and drop refs
  const ref = (el: HTMLDivElement) => {
    dragRef(el)
    dropRef(el)
  }

  return (
    <div
      ref={ref}
      onClick={onNavigate}
      className={`
        flex items-center space-x-2 p-2 rounded cursor-pointer
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isOver ? 'bg-primary/20' : 'hover:bg-accent'}
      `}
    >
      <Folder className="h-5 w-5 text-blue-500" />
      <span className="truncate">{name}</span>
    </div>
  )
}