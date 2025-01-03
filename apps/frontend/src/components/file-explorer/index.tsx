"use client";

import { useState, useMemo, useEffect } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { FileList } from "./file-list";
import { FileUpload } from "./file-upload";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { FileToolbar } from "./file-toolbar";
import { SearchBar } from "./search-bar";
import { DragProvider } from "./drag-provider";
import { getAllFoldersByOwner, createFolder } from "@/lib/folder";

type File = { 
  id: string; 
  name: string; 
  type: "folder" | "file"; 
  parentId?: string | null; 
  subfolders?: File[]; 
};

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileStructure, setFileStructure] = useState<{ [key: string]: File[] }>({});
  const [files, setFiles] = useState<File[]>([]);
  const { data: session } = useSession();

  if (!session) {
    return redirect("/auth");
  }

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await getAllFoldersByOwner(session?.user?.email as string);
        
        // Create a map of folders by ID for easier lookup
        const folderMap = new Map();
        data.forEach((folder: any) => {
          folderMap.set(folder.id, {
            id: folder.id,
            name: folder.name,
            type: "folder",
            parentId: folder.parentId,
            subfolders: [],
          });
        });

        // Build the folder hierarchy
        const rootFolders: File[] = [];
        data.forEach((folder: any) => {
          const folderObj = folderMap.get(folder.id);
          if (folder.parentId) {
            const parentFolder = folderMap.get(folder.parentId);
            if (parentFolder) {
              parentFolder.subfolders.push(folderObj);
            }
          } else {
            rootFolders.push(folderObj);
          }
        });

        // Initialize the file structure with root folders
        setFileStructure({ "": rootFolders });
        setFiles(rootFolders);
      } catch (error) {
        console.error("Failed to fetch folder structure:", error);
      }
    };

    fetchFolders();
  }, [session?.user?.email]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    return files.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, files]);

  const findFolderByPath = (path: string[]): File[] => {
    if (path.length === 0) return fileStructure[""] || [];
    
    let current = fileStructure[""];
    for (const segment of path) {
      const folder = current.find(f => f.name === segment);
      if (!folder) return [];
      current = folder.subfolders || [];
    }
    return current;
  };

  const onNavigate = (path: string[]) => {
    const folderContents = findFolderByPath(path);
    setCurrentPath(path);
    setFiles(folderContents);
  };

  const onBack = () => {
    if (currentPath.length > 0) {
      const parentPath = currentPath.slice(0, -1);
      onNavigate(parentPath);
    }
  };

  const handleFileUploaded = (fileRecord: any) => {
    const newFile: File = {
      id: fileRecord.id,
      name: fileRecord.name,
      type: "file",
    };

    // Update current view
    setFiles(prev => [...prev, newFile]);

    // Update file structure
    const currentPathKey = currentPath.join("/");
    setFileStructure(prev => ({
      ...prev,
      [currentPathKey]: [...(prev[currentPathKey] || []), newFile as File],
    }));
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      if (!session?.user?.email) {
        throw new Error("Session user email is missing.");
      }

      // Find the current folder's ID based on the path
      let parentId = null;
      if (currentPath.length > 0) {
        const currentFolder = findFolderByPath(currentPath.slice(0, -1))
          .find(f => f.name === currentPath[currentPath.length - 1]);
        parentId = currentFolder?.id || null;
      }

      const newFolder = await createFolder(folderName, session.user.email, parentId);
      const newFolderObj: File = {
        id: newFolder.id,
        name: folderName,
        type: "folder",
        parentId,
        subfolders: [],
      };

      // Update the current view
      setFiles(prev => [...prev, newFolderObj]);

      // Update the file structure
      const currentPathKey = currentPath.join("/");
      setFileStructure(prev => ({
        ...prev,
        [currentPathKey]: [...(prev[currentPathKey] || []), newFolderObj],
      }));
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleMove = async (sourceId: string, targetPath: string[], sourcePath: string[]) => {
    // ... rest of the handleMove function remains the same
  };

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
        <FileToolbar 
          currentPath={currentPath.join("/")}
          onCreateFolder={handleCreateFolder}
          onFileUploaded={handleFileUploaded}
        />
        <FileUpload 
          currentPath={currentPath.join("/")} 
          onFileUploaded={handleFileUploaded}
        />
        <FileList
          currentPath={currentPath}
          files={filteredFiles}
          onNavigate={onNavigate}
          onBack={onBack}
          onMove={handleMove}
        />
      </div>
    </DragProvider>
  );
}