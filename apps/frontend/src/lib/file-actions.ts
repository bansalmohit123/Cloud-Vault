"use server";
import { ok } from "assert";
import { prisma } from "./prisma";


export const renamefile = async (fileId: string, name: string) => {
    try {
    return await prisma.file.update({
        where: { id: fileId },
        data: { name },
    });
    } catch (error) {
    console.error(error);
    return null;
    }
    };


    // Delete File
    export const deleteFile = async (fileId: string) => {
        try {
            // Step 1: Fetch file metadata to get folderId and filename
            const file = await prisma.file.findUnique({
                where: { id: fileId },
                select: { id: true, folderId: true, name: true },
            });
    
            if (!file) {
                throw new Error("File not found");
            }
    
            // Construct S3 key: folderId/filename
            const s3Key = `${file.folderId || "root"}/${file.name}`;
    
            // Step 2: Delete file from DB
            await prisma.file.delete({
                where: { id: fileId },
            });
    
            // Step 3: Attempt S3 deletion
            const result = await fetch(`/api/deleteFile`, {
                method: "POST",
                body: JSON.stringify({ s3Key }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (!result.ok) {
                console.error("Failed to delete file from S3:", s3Key);
                // Optionally log the failure for retry or manual cleanup
            }
    
            return { success: true, s3Key };
        } catch (error) {
            console.error("Error deleting file:", error);
            return { success: false, error };
        }
    };
    
    // Delete Folder
    export const deleteFolder = async (folderId: string) => {
        try {
            // Step 1: Fetch all files in the folder to construct S3 keys
            const files = await prisma.file.findMany({
                where: { folderId },
                select: { name: true },
            });
    
            // Construct S3 keys for files
            const s3Keys = files.map((file) => `${folderId}/${file.name}`);
    
            // Step 2: Delete all files from DB
            await prisma.file.deleteMany({
                where: { folderId },
            });
    
            // Step 3: Delete folder metadata from DB
            await prisma.folder.delete({
                where: { id: folderId },
            });
    
            // Step 4: Attempt S3 deletion for all files and the folder itself
            await Promise.all(
                s3Keys.map(async (s3Key) => {
                    const result = await fetch(`${process.env.SERVER_URL}/api/deleteFile`, {
                        method: "POST",
                        body: JSON.stringify({ s3Key }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
    
                    if (!result.ok) {
                        console.error("Failed to delete file from S3:", s3Key);
                    }
                })
            );
    
            // Optionally, delete the folder itself in S3 if it's an actual directory object
            const folderS3Key = `${folderId}/`; // Folder key
            const folderDeletion = await fetch(`${process.env.SERVER_URL}/api/deleteFolder`, {
                method: "POST",
                body: JSON.stringify({ s3Key: folderS3Key }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (!folderDeletion.ok) {
                console.error("Failed to delete folder from S3:", folderS3Key);
            }
    
            return { success: true };
        } catch (error) {
            console.error("Error deleting folder:", error);
            return { success: false, error };
        }
    };
    

export const renameFolder = async (folderId: string, name: string) => {
    try {
    return await prisma.folder.update({
        where: { id: folderId },
        data: { name },
    });
    } catch (error) {
    console.error(error);
    return null;
    }
    }


export const downloadFolder = async (folderId: string) => {
    try {
        console.log("folderId", folderId);

        // Fetch the ZIP file stream from the backend
    const response = await fetch(`${process.env.SERVER_URL}/api/folder/download/${folderId}`);
      if (!response.ok) {
        throw new Error("Failed to download folder");
      }
      console.log("response", response);

      return await response.blob();;
    }
    catch (error) {
        console.error("Error downloading folder:", error);
        return null;
    }
    }

