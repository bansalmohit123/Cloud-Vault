"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  currentPath: string;
  onFileUploaded: (file: any) => void;
}

export function FileUpload({ currentPath, onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        try {
          const fileRecord = await uploadFile(acceptedFiles[0], currentPath);
          onFileUploaded(fileRecord);
          toast({
            title: "Success",
            description: "File uploaded successfully",
          });
        } catch (error) {
          console.error("Upload error:", error);
          toast({
            title: "Error",
            description: "Failed to upload file",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      }
    },
    [currentPath, onFileUploaded, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 ${
        isDragActive ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <div className="flex flex-col items-center justify-center py-4">
          <Upload className="h-8 w-8 mb-2 text-primary animate-bounce" />
          <p className="text-primary">Drop files here to upload</p>
        </div>
      ) : (
        <div className="text-center">
          {isUploading ? "Uploading..." : "Drag and drop files here"}
        </div>
      )}
    </div>
  );
}