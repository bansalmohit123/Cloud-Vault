"use client";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Folder } from "lucide-react";
import { ItemMenu } from "./item-menu";
import { RenameDialog } from "./rename-dialog";
import { useToast } from "@/hooks/use-toast";
import { downloadFolder } from "@/lib/file-actions";

interface FolderItemProps {
  id: string;
  name: string;
  path: string[];
  onNavigate: () => void;
  onMove: (sourceId: string, targetPath: string[], sourcePath: string[]) => void;
  onDelete: () => Promise<void>;
  onRename: (newName: string) => Promise<void>;
}

export function FolderItem({
  id,
  name,
  path,
  onNavigate,
  onMove,
  onDelete,
  onRename,
}: FolderItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const { toast } = useToast();

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "FILE_OR_FOLDER",
    item: { id, name, type: "folder", sourcePath: path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "FILE_OR_FOLDER",
    drop: (item: { id: string; sourcePath: string[] }) => {
      if (item.id !== id) {
        onMove(item.id, [...path, name], item.sourcePath);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleShare = () => {
    toast({
      title: "Folder sharing",
      description: "Folder sharing is not available yet",
    });
  };

  const handleRename = async (newName: string) => {
    try {
      await onRename(newName);
      setIsRenaming(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename folder",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    try {
      // Notify the user the download has started
      toast({
        title: "Folder download",
        description: "Your folder is being prepared for download...",
      });

      const response = await downloadFolder(id);
      if(response === null) {
        throw new Error("Failed to download folder");
      }
      
      const url = window.URL.createObjectURL(response);
  
      // Trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      // Revoke the blob URL to release memory
      window.URL.revokeObjectURL(url);
  
      toast({
        title: "Folder download",
        description: "Your folder has been downloaded successfully!",
      });
    } catch (error) {
      console.error("Error downloading folder:", error);
      toast({
        title: "Folder download",
        description: "Failed to download the folder. Please try again later.",
        variant: "destructive",
      });
    }
  };
  

  // Combine drag and drop refs
  const ref = (el: HTMLDivElement) => {
    dragRef(el);
    dropRef(el);
  };

  return (
    <>
      <div
        ref={ref}
        onClick={onNavigate}
        className={`
          group relative flex items-center space-x-2 p-2 rounded cursor-pointer
          ${isDragging ? "opacity-50" : "opacity-100"}
          ${isOver ? "bg-primary/20" : "hover:bg-accent"}
        `}
      >
        <Folder className="h-5 w-5 text-blue-500" />
        <span className="truncate">{name}</span>
        <ItemMenu
          type="folder"
          onShare={handleShare}
          onDelete={onDelete}
          onRename={() => setIsRenaming(true)}
          onDownload={handleDownload}
        />
      </div>

      <RenameDialog
        isOpen={isRenaming}
        onClose={() => setIsRenaming(false)}
        onRename={handleRename}
        currentName={name}
        type="folder"
      />
    </>
  );
}