"use client";

import { useState } from "react";
import { FolderItem } from "./folder-item";
import { DraggableItem } from "./draggable-item";
import { ArrowLeft, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/x.y.z/pdf.worker.min.js`;

interface File {
  id: string;
  name: string;
  type: "file" | "folder";
  url?: string; // Presigned URL for the file
}

interface FileListProps {
  currentPath: string[];
  files: File[];
  onNavigate: (path: string[]) => void;
  onBack: () => void;
  onMove: (sourceId: string, targetPath: string[], srcPath: string[]) => void;
}

export function FileList({
  currentPath,
  files,
  onNavigate,
  onBack,
  onMove,
}: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { toast } = useToast();
  const isRoot = currentPath.length === 0;

  const handleFileClick = (file: File) => {
    if (file.type === "file" && file.url) {
      setSelectedFile(file);
      setPageNumber(1); // Reset to first page when opening a new file
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
    const commonClasses = "max-w-full max-h-[calc(100vh-200px)] mx-auto";
    
    if (file.url && file.url.endsWith(".pdf")) {
      return (
        <div className="flex flex-col items-center">
          {/* <Document
            file={file.url}
            onLoadSuccess={onDocumentLoadSuccess}
            className={commonClasses}
          >
            <Page pageNumber={pageNumber} />
          </Document> */}
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
  className={commonClasses}
>
  <Page pageNumber={pageNumber} />
</Document>

          <div className="mt-4 flex items-center space-x-4">
            <Button 
              onClick={() => setPageNumber(page => Math.max(page - 1, 1))}
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <Button 
              onClick={() => setPageNumber(page => Math.min(page + 1, numPages || 1))}
              disabled={pageNumber >= (numPages || 1)}
            >
              Next
            </Button>
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
      {/* File Viewer Modal */}
      <Dialog open={selectedFile !== null} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] overflow-hidden flex flex-col items-center justify-center">
          <DialogHeader className="w-full">
            <DialogTitle className="text-center">{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 w-full flex items-center justify-center">
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
            onClick={() => item.type === "file" && handleFileClick(item)}
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
              />
            ) : (
              <DraggableItem
                id={item.id}
                name={item.name}
                type="file"
                path={currentPath}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

