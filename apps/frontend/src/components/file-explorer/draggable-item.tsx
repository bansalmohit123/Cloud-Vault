"use client";
import { useState } from "react";
import { useDrag } from "react-dnd";
import { File } from "lucide-react";
import { ItemMenu } from "./item-menu";
import { RenameDialog } from "./rename-dialog";
import { useToast } from "@/hooks/use-toast";

interface DraggableItemProps {
  id: string;
  name: string;
  type: "file";
  path: string[];
  url?: string;
  onDelete: () => Promise<void>;
  onRename: (newName: string) => Promise<void>;
}

export function DraggableItem({ id, name, type, path, url, onDelete, onRename }: DraggableItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const { toast } = useToast();

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "FILE_OR_FOLDER",
    item: { id, name, type, sourcePath: path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleShare = async () => {
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied to clipboard",
          description: "You can now share this file with others",
        });
      } catch (err) {
        toast({
          title: "Failed to copy link",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
  };

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
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = ""; // Add custom filename if required
      a.click();  
    }
    else{
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div
        ref={dragRef as any}
        className={`
          group relative flex items-center space-x-3 p-4 rounded-md cursor-move
          transition-all duration-200 ease-in-out
          bg-gradient-to-r from-gray-900 to-gray-800
          border border-gray-700 hover:border-indigo-500
          shadow-lg hover:shadow-indigo-500/20
          ${isDragging ? "opacity-50 scale-95" : "opacity-100"}
          hover:bg-gray-800
        `}
      >
        <File className="h-6 w-6 text-indigo-400 flex-shrink-0" />
        <span className="truncate text-gray-200 text-lg font-normal">{name}</span>
        <div className="absolute right-4 top-[20%] transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ItemMenu
            type="file"
            onShare={handleShare}
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
    </>
  );
}