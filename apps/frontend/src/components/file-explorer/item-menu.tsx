"use client";

import {
  MoreVertical,
  Share2,
  Trash2,
  Download,
  FileEdit,
  FolderEdit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ItemMenuProps {
  type: "file" | "folder";
  onShare?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onRename?: () => void;
}

export function ItemMenu({ type, onShare, onDelete, onDownload, onRename }: ItemMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onShare?.();
        }}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onRename?.();
        }}>
          {type === "folder" ? (
            <FolderEdit className="mr-2 h-4 w-4" />
          ) : (
            <FileEdit className="mr-2 h-4 w-4" />
          )}
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onDownload?.();
        }}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
