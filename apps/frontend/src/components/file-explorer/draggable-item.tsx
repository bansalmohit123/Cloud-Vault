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
        className={`group relative flex items-center space-x-2 p-2 rounded cursor-move
          ${isDragging ? "opacity-50" : "opacity-100"}
          hover:bg-accent`}
      >
        <File className="h-5 w-5 text-gray-500" />
        <span className="truncate">{name}</span>
        <ItemMenu
          type="file"
          onShare={handleShare}
          onDelete={onDelete}
          onDownload={handleDownload}
          onRename={() => setIsRenaming(true)}
        />
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