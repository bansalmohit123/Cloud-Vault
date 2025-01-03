// // lib/uploadUtils.ts
'use server';

import axios from "axios";
import { generateSinglePresignedUrl, startMultipartUpload, generatePresignedUrls, completeMultipartUpload } from "@/lib/api";

interface Part {
  ETag: string;
  PartNumber: number;
}

export const uploadFile = async (file: File) => {
  try {
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
      const parts: Part[] = [];

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
  }
};
