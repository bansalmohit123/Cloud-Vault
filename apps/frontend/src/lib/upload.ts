"use server";
import axios from "axios";
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Determine folder ID from the path
    let currentFolderId = null;
    if (currentPath) {
      const pathSegments = currentPath.split("/").filter(Boolean);
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

    const { data: { presignedUrls, uploadId } } = await axios.post(`${process.env.SERVER_URL}/api/presigned-urls`, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folderId: currentFolderId,
    });

    const chunkSize = 10 * 1024 * 1024; // 10 MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadPromises = [];
    const parts: Part[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      uploadPromises.push(
        axios
          .put(presignedUrls[i], chunk, { headers: { "Content-Type": file.type } })
          .then((res) => {
            parts.push({
              ETag: res.headers.etag,
              PartNumber: i + 1,
            });
          })
      );
    }

    await Promise.all(uploadPromises);

    if (uploadId) {
      // Complete multipart upload
      const result = await axios.post(`${process.env.SERVER_URL}/api/complete-upload`, {
        fileName: file.name,
        uploadId,
        parts,
        folderId: currentFolderId,
      });
      if(result?.data?.error) {
        throw new Error("Error generating presigned URLs");
      }
    }


    const fileUrl = presignedUrls[0].split("?")[0]; // Final URL
    if(currentFolderId === null){
      currentFolderId = "";
    }

    const fileData: any = {
      name: file.name,
      type: file.type,
      size: file.size,
      ownerId: user.id,
      url: fileUrl,
    };

    if (currentFolderId) {
      fileData.folderId = currentFolderId;
    }

    const fileRecord = await prisma.file.create({
      data: fileData,
    });

    return fileRecord;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
