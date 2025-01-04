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
          group relative flex items-center space-x-3 p-4 rounded-md cursor-pointer
          transition-all duration-200 ease-in-out
          bg-gradient-to-r from-gray-900 to-gray-800
          border border-gray-700 hover:border-blue-500
          shadow-lg hover:shadow-blue-500/20
          ${isDragging ? "opacity-50 scale-95" : "opacity-100"}
          ${isOver ? "bg-primary/20 border-primary" : "hover:bg-gray-800"}
        `}
      >
        <Folder className="h-6 w-6 text-blue-400 flex-shrink-0" />
        <span className="truncate text-gray-200 text-lg font-semibold">{name}</span>
        <div className="absolute right-4 top-[20%] transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ItemMenu
            type="folder"
            onShare={handleShare}
            onDelete={onDelete}
            onRename={() => setIsRenaming(true)}
            onDownload={handleDownload}
          />
        </div>
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