"use client"

import { useState, useMemo } from "react"
import { FileList } from "./file-list"
import { FileUpload } from "./file-upload"
import { BreadcrumbNav } from "./breadcrumb-nav"
import { FileToolbar } from "./file-toolbar"
import { SearchBar } from "./search-bar"
import { DragProvider } from "./drag-provider"

type File = { id: string; name: string; type: "folder" | "file" }

const initialFiles: { [key: string]: File[] } = {
  "": [
    { id: "1", name: "Documents", type: "folder" },
    { id: "2", name: "Images", type: "folder" },
    { id: "3", name: "report.pdf", type: "file" },
  ],
  "Documents": [
    { id: "4", name: "Notes", type: "folder" },
    { id: "5", name: "budget.xlsx", type: "file" },
  ],
  "Documents/Notes": [
    { id: "6", name: "note1.txt", type: "file" },
    { id: "7", name: "note2.txt", type: "file" },
  ],
}

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [fileStructure, setFileStructure] = useState(initialFiles)
  const [files, setFiles] = useState<File[]>(initialFiles[""])

  // Handle file filtering based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files
    return files.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, files])

  const onNavigate = (path: string[]) => {
    const pathKey = path.join("/")
    setCurrentPath(path)
    setFiles(fileStructure[pathKey] || [])
  }

  const onBack = () => {
    if (currentPath.length > 0) {
      const parentPath = currentPath.slice(0, -1)
      onNavigate(parentPath)
    }
  }

  const handleCreateFolder = (folderName: string) => {
    const pathKey = currentPath.join("/")
    const newFolder: File = {
      id: Date.now().toString(),
      name: folderName,
      type: "folder",
    }

    // Update file structure and current files
    const updatedFiles = [...(fileStructure[pathKey] || []), newFolder]
    setFileStructure({ ...fileStructure, [pathKey]: updatedFiles })
    setFiles(updatedFiles)
  }

  const handleMove = async (sourceId: string, targetPath: string[], sourcePath: string[]) => {
    // Update UI optimistically
    const sourcePathKey = sourcePath.join('/')
    const targetPathKey = targetPath.join('/')
    
    const sourceFiles = [...(fileStructure[sourcePathKey] || [])]
    const targetFiles = [...(fileStructure[targetPathKey] || [])]
    
    const movedItem = sourceFiles.find(f => f.id === sourceId)
    if (movedItem) {
      // Remove from source
      const newSourceFiles = sourceFiles.filter(f => f.id !== sourceId)
      // Add to target
      const newTargetFiles = [...targetFiles, movedItem]
      
      setFileStructure({
        ...fileStructure,
        [sourcePathKey]: newSourceFiles,
        [targetPathKey]: newTargetFiles
      })

      if (sourcePathKey === currentPath.join('/')) {
        setFiles(newSourceFiles)
      } else if (targetPathKey === currentPath.join('/')) {
        setFiles(newTargetFiles)
      }
    }
  }

  return (
    <DragProvider>
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <BreadcrumbNav path={currentPath} onNavigate={onNavigate} />
        </div>
        <div className="w-64">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>
      <FileToolbar onCreateFolder={handleCreateFolder} />
      <FileUpload currentPath={currentPath.join("/")} />
      <FileList
        currentPath={currentPath}
        files={filteredFiles} // Use filtered files for display
        onNavigate={onNavigate}
        onBack={onBack}
        onMove={handleMove}
      />
    </div>
    </DragProvider>
  )
}
