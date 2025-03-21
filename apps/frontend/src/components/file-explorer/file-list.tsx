"use client";

import { useState } from "react";
import { FolderItem } from "./folder-item";
import { DraggableItem } from "./draggable-item";
import { ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import dotenv from 'dotenv';
dotenv.config();
// import { RenderFileContent} from './render-file'
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface File {
  id: string;
  name: string;
  type: "file" | "folder";
  url?: string;
  filetype?: string;
  size?: number;
}

interface FileListProps {
  currentPath: string[];
  files: File[];
  onNavigate: (path: string[]) => void;
  onBack: () => void;
  onMove: (sourceId: string, targetPath: string[], srcPath: string[]) => void;
  onDeleteFile: (fileId: string) => Promise<void>;
  onRenameFile: (fileId: string, newName: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string) => Promise<void>;
}

export function FileList({
  currentPath,
  files,
  onNavigate,
  onBack,
  onMove,
  onDeleteFile,
  onRenameFile,
  onDeleteFolder,
  onRenameFolder,
}: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const { toast } = useToast();
  const isRoot = currentPath.length === 0;

  const handleFileClick = (file: File) => {
    if (file.type === "file" && file.url) {
      const lastPart = file.url.substring(file.url.lastIndexOf('/') + 1);
      // console.log(lastPart);
      file.url =  `${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN_NAME}`+lastPart;
      // console.log(file.url)
      setSelectedFile(file);
      setPageNumber(1); // Reset to first page when opening a new file
      setScale(1);
    } else {
      toast({
        title: "Error",
        description: "Unable to open this file.",
        variant: "destructive",
      });
    }
  };



  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const renderFileContent = (file: File) => {
    const commonClasses = "max-w-full max-h-[calc(100vh-250px)] mx-auto";
    if (file.url && file.url.endsWith(".pdf")) {
      return (
        <div className="flex flex-col items-center w-full h-full">
          <div className="flex-grow overflow-auto w-full max-h-[calc(100vh-250px)] flex justify-center">
            <Document
              file={file.url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={() => {
                toast({
                  title: "Error",
                  description: "Failed to load the PDF file.",
                  variant: "destructive",
                });
              }}
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
          </div>
          <div className="mt-4 flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setPageNumber(page => Math.max(page - 1, 1))}
                disabled={pageNumber <= 1}
              >
                Previous
              </Button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <Button 
                onClick={() => setPageNumber(page => Math.min(page + 1, numPages || 1))}
                disabled={pageNumber >= (numPages || 1)}
              >
                Next
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setScale(s => Math.max(s - 0.1, 0.1))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span>{Math.round(scale * 100)}%</span>
              <Button onClick={() => setScale(s => Math.min(s + 0.1, 3))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    } 
    else if (file.url && file.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className={`object-contain ${commonClasses}`}
        />
      );
    } else if (file.url && file.url.match(/\.(mp4|webm)$/i)) {
      return (
        <video controls src={file.url} className={commonClasses}></video>
      );
    } else {
      return <p className="text-center">Preview not available for this file type.</p>;
    }
  
  };

  return (
    <div>
      <Dialog 
        open={selectedFile !== null} 
        onOpenChange={() => setSelectedFile(null)}
      >
        <DialogContent className="sm:max-w-[90vw] sm:h-[90vh] overflow-hidden flex flex-col items-center">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex-grow overflow-hidden">
            {selectedFile && renderFileContent(selectedFile)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation Header */}
      <div className="flex items-center space-x-4 mb-4">
        {!isRoot && (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        )}
        <span className="text-sm text-muted-foreground truncate">
          Current Path: {currentPath.join(" / ") || "/"}
        </span>
      </div>

      {/* File/Folder List */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((item) => (
            <div
            key={item.id}
            className="group relative bg-card rounded-lg"
            onDoubleClick={() => item.type === "file" && handleFileClick(item)}
            >
            {item.type === "folder" ? (
              <FolderItem
              id={item.id}
              name={item.name}
              path={currentPath}
              onNavigate={() => onNavigate([...currentPath, item.name])}
              onMove={(sourceId) =>
                onMove(sourceId, currentPath, [...currentPath, item.name])
              }
              onDelete={() => onDeleteFolder(item.id)}
              onRename={(newName) => onRenameFolder(item.id, newName)}
              />
            ) : (
              <DraggableItem
              id={item.id}
              name={item.name}
              type="file"
              path={currentPath}
              url={item.url as string}
              folderId={currentPath[currentPath.length - 1]}
              filetype= {item.type}
              size = {item.size as number}
              onDelete={() => onDeleteFile(item.id)}
              onRename={(newName : any) => onRenameFile(item.id, newName)}
              />
            )}
            </div>
        ))}
      </div>
    </div>
  );
}

