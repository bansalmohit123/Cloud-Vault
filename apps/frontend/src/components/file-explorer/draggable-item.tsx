"use client";

import { useState } from "react";
import { useDrag } from "react-dnd";
import { File } from 'lucide-react';
import { ItemMenu } from "./item-menu";
import { RenameDialog } from "./rename-dialog";
import { useToast } from "@/hooks/use-toast";
import { ShareDialog } from "./share-dialog";
import { checkAndIncrementDownload } from "@/lib/limit";
import { useSubscription } from "../subscription-provider"; 

interface DraggableItemProps {
  id: string;
  name: string;
  type: "file";
  path: string[];
  url?: string;
  size: number;
  filetype: string;
  folderId: string | null;
  onDelete: () => Promise<void>;
  onRename: (newName: string) => Promise<void>;
}

export function DraggableItem({ id, name, type, path, url, folderId, filetype, size, onDelete, onRename }: DraggableItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "FILE_OR_FOLDER",
    item: { id, name, type, sourcePath: path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleRename = async (newName: string) => {
    try {
      await onRename(newName);
      setIsRenaming(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename file",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if(!isPremium){
    const downloadLimit = checkAndIncrementDownload();
    if (!downloadLimit) {
      toast({
        title: "Error",
        description: "Download limit exceeded",
        variant: "destructive",
      });
      return;
    }
  }
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
    } else {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} bytes`;
  };

  return (
    <>
      <div
        ref={dragRef as any}
        className={`
          group relative flex flex-col justify-center p-4 rounded-md cursor-move
          transition-all duration-200 ease-in-out
          bg-gradient-to-r from-gray-900 to-gray-800
          border border-gray-700 hover:border-indigo-500
          shadow-lg hover:shadow-indigo-500/20
          ${isDragging ? "opacity-50 scale-95" : "opacity-100"}
          hover:bg-gray-800
        `}
      >
        <div className="flex items-center space-x-3">
          <File className="h-6 w-6 text-indigo-400 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="truncate text-gray-200 text-lg font-normal">{name}</span>
            <span className="text-gray-400 text-xs font-normal">{formatFileSize(size)}</span>
          </div>
        </div>

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ItemMenu
            type="file"
            onShare={() => setIsShareDialogOpen(true)}
            onDelete={onDelete}
            onDownload={handleDownload}
            onRename={() => setIsRenaming(true)}
          />
        </div>
      </div>

      <RenameDialog
        isOpen={isRenaming}
        onClose={() => setIsRenaming(false)}
        onRename={handleRename}
        currentName={name}
        type="file"
      />
      <ShareDialog 
        isOpen={isShareDialogOpen} 
        onClose={() => setIsShareDialogOpen(false)} 
        fileUrl={url as string}
        fileName={name}
        folderId={folderId}
      />
    </>
  );
}

