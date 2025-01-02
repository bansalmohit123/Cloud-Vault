// FileUpload.tsx

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { uploadFile } from "@/lib/upload"; // Import the uploadFile function

interface FileUploadProps {
  currentPath: string;
}

export function FileUpload({ currentPath }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        uploadFile(acceptedFiles[0])
          .finally(() => setIsUploading(false)); // Handle uploading state
      }
    },
    [currentPath]
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
