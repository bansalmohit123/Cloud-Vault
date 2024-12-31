"use client"

import { useState } from "react"
import { FileList } from "./file-list"
import { FileUpload } from "./file-upload"
import { BreadcrumbNav } from "./breadcrumb-nav"
import { FileToolbar } from "./file-toolbar"

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string[]>([])

  return (
    <div className="space-y-4">
      <BreadcrumbNav path={currentPath} onNavigate={setCurrentPath} />
      <FileToolbar />
      <FileUpload currentPath={currentPath.join("/")} />
      <FileList currentPath={currentPath} onNavigate={setCurrentPath} />
    </div>
  )
}