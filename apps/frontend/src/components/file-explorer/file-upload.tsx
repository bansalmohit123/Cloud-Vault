"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import axios from "axios";
import {
  generateSinglePresignedUrl,
  startMultipartUpload,
  generatePresignedUrls,
  completeMultipartUpload,
} from "@/lib/api";

interface FileUploadProps {
  currentPath: string;
}

export function FileUpload({ currentPath }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);

      if (file.size < 10 * 1024 * 1024) {
        // Single-part upload
        const url = await generateSinglePresignedUrl(file.name);
        await axios.put(url, file, {
          headers: { "Content-Type": file.type },
        });
        alert("File uploaded successfully!");
      } else {
        // Multipart upload
        const uploadId = await startMultipartUpload(file.name, file.type);
        const chunkSize = 10 * 1024 * 1024; // 10MB
        const totalChunks = Math.ceil(file.size / chunkSize);

        const presignedUrls = await generatePresignedUrls(file.name, uploadId, totalChunks);

        const uploadPromises = [];
        const parts: { ETag: string; PartNumber: number }[] = [];

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);

          uploadPromises.push(
            axios
              .put(presignedUrls[i], chunk, {
                headers: { "Content-Type": file.type },
              })
              .then((res) => {
                parts.push({
                  ETag: res.headers.etag,
                  PartNumber: i + 1,
                });
              })
          );
        }

        await Promise.all(uploadPromises);

        await completeMultipartUpload(file.name, uploadId, parts);
        alert("File uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0]);
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
