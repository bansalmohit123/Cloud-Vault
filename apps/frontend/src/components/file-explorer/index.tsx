"use client";

import { useState, useMemo, useEffect, use } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { FileList } from "./file-list";
import { FileUpload } from "./file-upload";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { FileToolbar } from "./file-toolbar";
import { SearchBar } from "./search-bar";
import { DragProvider } from "./drag-provider";
import { getAllFoldersByOwner, createFolder } from "@/lib/folder";
import { url } from "inspector";
import { deleteFile, renamefile, deleteFolder, renameFolder } from "@/lib/file-actions";
import { useToast } from "@/hooks/use-toast";

type File = { 
  id: string; 
  name: string; 
  type: "folder" | "file"; 
  parentId?: string | null; 
  subfolders?: File[]; 
  url? : string | undefined;
  filetype?: string;
  size?: number;
};

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileStructure, setFileStructure] = useState<{ [key: string]: File[] }>({});
  const [files, setFiles] = useState<File[]>([]);
  const { data: session } = useSession();
  const { toast } = useToast();

  if (!session) {
    return redirect("/auth");
  }
  useEffect(() => {
  const fetchFolders = async () => {
    try {
      const data = await getAllFoldersByOwner(session?.user?.email as string);
  
      const folderMap = new Map();
  
      // Process folders
      data.folders.forEach((item: any) => {
        folderMap.set(item.id, {
          id: item.id,
          name: item.name,
          type: "folder",
          parentId: item.parentId,
          subfolders: [],
        });
      });
  
      // Add files to their respective folders
      data.folders.forEach((folder: any) => {
        const folderObj = folderMap.get(folder.id);
        if (folder.files.length > 0) {
          folder.files.forEach((file: any) => {
            const fileObj = {
              id: file.id,
              name: file.name,
              type: "file",
              parentId: folder.id,
              url: file.url, // Assuming file.url exists
              filetype: file.type,
              size: file.size,
            };
            console.log("fileObj",fileObj);
            folderObj.subfolders.push(fileObj);
          });
        }
      });
  
      // Build the folder hierarchy
      const rootFolders: any[] = [];
      data.folders.forEach((folder: any) => {
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
  
      // Add root files to the root folder structure
      const rootFiles = data.rootFiles.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: "file",
        parentId: null,
        url: file.url,
        filetype: file.type,
        size: file.size,
      }));
  
      const combinedRoot = [...rootFolders, ...rootFiles];
  
      setFileStructure({ "": combinedRoot });
      setFiles(combinedRoot);
    } catch (error) {
      console.error("Failed to fetch folder structure:", error);
    }
  };
  fetchFolders();
}, [session]);
  
  

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
      url : fileRecord.url
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

  const handleDeleteFile = async (fileId: string) => {
    const result = await deleteFile(fileId);
    if (result.success) {
      // Update the current view
      setFiles(prev => prev.filter(file => file.id !== fileId));

      // Update file structure
      const currentPathKey = currentPath.join("/");
      setFileStructure(prev => ({
        ...prev,
        [currentPathKey]: prev[currentPathKey].filter(file => file.id !== fileId),
      }));

      // Show a toast message
      toast({
        title: "File deleted",
      });
    } else {
      toast({
        title: "Error",
      });
    }
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    const result = await renamefile(fileId, newName);
    if (result) {
      // Update the current view
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, name: newName } : file
      ));

      // Update file structure
      const currentPathKey = currentPath.join("/");
      setFileStructure(prev => ({
        ...prev,
        [currentPathKey]: prev[currentPathKey].map(file =>
          file.id === fileId ? { ...file, name: newName } : file
        ),
      }));

      toast({
        title: "Success",
      });
    } else {
      toast({
        title: "Error",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const result = await deleteFolder(folderId);
    if (result.success) {
      setFiles(prev => prev.filter(item => item.id !== folderId));
      const currentPathKey = currentPath.join("/");
      setFileStructure(prev => ({
        ...prev,
        [currentPathKey]: prev[currentPathKey].filter(item => item.id !== folderId),
      }));
      toast({ title: "Success",});
    } else {
      toast({
        title: "Error",
        
      });
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      const result = await fetch("/api/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: folderId, newName, type: "folder" }),
      });

      if (result.ok) {
        setFiles(prev => 
          prev.map(item => item.id === folderId ? { ...item, name: newName } : item)
        );
        const currentPathKey = currentPath.join("/");
        setFileStructure(prev => ({
          ...prev,
          [currentPathKey]: prev[currentPathKey].map(item =>
            item.id === folderId ? { ...item, name: newName } : item
          ),
        }));
        toast({ title: "Success"});
      } else {
        throw new Error("Failed to rename folder");
      }
    } catch (error) {
      toast({
        title: "Error",
        
      });
    }
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
          setFiles(newSourceFiles);
        } else if (targetPathKey === currentPath.join('/')) {
          setFiles(newTargetFiles);
        }
      }
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
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
          onDeleteFolder={handleDeleteFolder}
          onRenameFolder={handleRenameFolder}
        />
      </div>
    </DragProvider>
  );
}