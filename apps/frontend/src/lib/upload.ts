'use server';

import axios from "axios";
import { generateSinglePresignedUrl, startMultipartUpload, generatePresignedUrls, completeMultipartUpload } from "@/lib/api";
import { uploadFile as createFileRecord } from "@/lib/folder";
import { auth } from "../../auth";
import { prisma } from "./prisma";

interface Part {
  ETag: string;
  PartNumber: number;
}

export const uploadFile = async (file: File, currentPath: string) => {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("User not authenticated");
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Find current folder ID based on path
    let currentFolderId = null;
    if (currentPath) {
      const pathSegments = currentPath.split('/').filter(Boolean);
      let parentId = null;
      
      for (const segment of pathSegments) {
        const folder: { id: string } | null = await prisma.folder.findFirst({
          where: {
            name: segment,
            ownerId: user.id,
            parentId: parentId,
          },
        });
        if (!folder) break;
        parentId = folder.id;
      }
      currentFolderId = parentId;
    }

    let fileUrl = '';
    
    if (file.size < 10 * 1024 * 1024) {
      // Single-part upload
      const url = await generateSinglePresignedUrl(file.name);
      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
      });
      fileUrl = url.split('?')[0]; // Get the base URL without query parameters
    } else {
      // Multipart upload
      const uploadId = await startMultipartUpload(file.name, file.type);
      const chunkSize = 10 * 1024 * 1024;
      const totalChunks = Math.ceil(file.size / chunkSize);
      const presignedUrls = await generatePresignedUrls(file.name, uploadId, totalChunks);
      
      const uploadPromises = [];
      const parts: Part[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        uploadPromises.push(
          axios.put(presignedUrls[i], chunk, {
            headers: { "Content-Type": file.type },
          }).then((res) => {
            parts.push({
              ETag: res.headers.etag,
              PartNumber: i + 1,
            });
          })
        );
      }

      await Promise.all(uploadPromises);
      const result = await completeMultipartUpload(file.name, uploadId, parts);
      fileUrl = result.Location || presignedUrls[0].split('?')[0];
    }

    // Create file record in database
    const fileRecord = await createFileRecord(
      file.name,
      file.type,
      file.size,
      user.id,
      currentFolderId || '',
      fileUrl
    );

    return fileRecord;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};