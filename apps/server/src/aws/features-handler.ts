import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, CopyObjectCommand } from "@aws-sdk/client-s3";
 import dotenv from "dotenv";
import s3Client from "../s3client";

dotenv.config();

  export const renameFileHandler = async (req, res) => {
    const { oldKey, newName } = req.body;

    if (!oldKey || !newName) {
        return res.status(400).json({ success: false, message: "Missing oldKey or newName." });
    }

    try {
        const newKey = oldKey.replace(/[^/]+$/, newName); // Replace the file name in the key

        // Step 1: Copy the file to the new key
        const copyCommand = new CopyObjectCommand({
            Bucket:  process.env.AWS_S3_BUCKET_NAME ,
            CopySource: `${process.env.AWS_S3_BUCKET_NAME }/${oldKey}`,
            Key: newKey,
        });
        await s3Client.send(copyCommand);

        // Step 2: Delete the old file
        const deleteCommand = new DeleteObjectCommand({
            Bucket:  process.env.AWS_S3_BUCKET_NAME ,
            Key: oldKey,
        });
        await s3Client.send(deleteCommand);

        res.json({ success: true, message: "File renamed successfully.", newKey });
    } catch (error) {
        console.error("Error renaming file:", error);
        res.status(500).json({ success: false, message: "Failed to rename file.", error: error.message });
    }
};



export const deletefile = async (req, res) => {
    const { s3Key } = req.body;
    try {

    
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME   , // replace with your bucket name
            Key: s3Key,
        };

        const command = new DeleteObjectCommand(params);
        const data = await s3Client.send(command);
        res.json({ success: true, s3Key });
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Failed to delete file" });
    }
};

export const deleteFolderHandler = async (req, res) => {
    try {
        const { s3Key } = req.body; // `s3Key` should be the folder key (e.g., "folderId/")

        if (!s3Key) {
            return res.status(400).json({ success: false, message: "Missing folder S3 key." });
        }

        // Step 1: List all objects (files) under the folder key
        const listObjectsCommand = new ListObjectsV2Command({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: s3Key,
        });

        const listResponse = await s3Client.send(listObjectsCommand);

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return res.status(404).json({ success: false, message: "No objects found in the folder." });
        }

        // Step 2: Construct delete parameters for all files in the folder
        const deleteParams = {
            Bucket:  process.env.AWS_S3_BUCKET_NAME,
            Delete: {
                Objects: listResponse.Contents.map((item) => ({ Key: item.Key })),
            },
        };

        // Step 3: Delete all files in the folder
        const deleteCommand = new DeleteObjectsCommand(deleteParams);
        const deleteResponse = await s3Client.send(deleteCommand);

        // Check for errors in deletion
        if (deleteResponse.Errors && deleteResponse.Errors.length > 0) {
            console.error("Errors while deleting objects:", deleteResponse.Errors);
            return res.status(500).json({
                success: false,
                message: "Failed to delete some or all objects in the folder.",
                errors: deleteResponse.Errors,
            });
        }

        return res.status(200).json({ success: true, message: "Folder and its contents deleted successfully." });
    } catch (error) {
        console.error("Error deleting folder from S3:", error);
        return res.status(500).json({ success: false, message: "Error deleting folder.", error: error.message });
    }
};

export const renameFolderHandler = async (req, res) => {
    try {
        const { folderId, newName } = req.body; // `folderId` is the current folder name, `newName` is the new folder name

        if (!folderId || !newName) {
            return res.status(400).json({ success: false, message: "Missing folderId or newName." });
        }

        // Step 1: List all objects under the current folder
        const listObjectsCommand = new ListObjectsV2Command({
            Bucket:  process.env.AWS_S3_BUCKET_NAME,
            Prefix: `${folderId}/`,
        });

        const listResponse = await s3Client.send(listObjectsCommand);

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return res.status(404).json({ success: false, message: "No objects found in the folder." });
        }

        // Step 2: Copy each object to the new folder name
        await Promise.all(
            listResponse.Contents.map(async (object) => {
                if (!object.Key) {
                    throw new Error("Object key is undefined");
                }
                const newKey = object.Key.replace(`${folderId}/`, `${newName}/`);

                const copyCommand = new CopyObjectCommand({
                    Bucket:  process.env.AWS_S3_BUCKET_NAME,
                    CopySource: `${process.env.AWS_S3_BUCKET_NAME}/${object.Key}`,
                    Key: newKey,
                });

                await s3Client.send(copyCommand);
            })
        );

        // Step 3: Delete all objects from the old folder
        const deleteParams = {
            Bucket:  process.env.AWS_S3_BUCKET_NAME,
            Delete: {
                Objects: listResponse.Contents.map((item) => ({ Key: item.Key })),
            },
        };

        const deleteCommand = new DeleteObjectsCommand(deleteParams);
        await s3Client.send(deleteCommand);

        return res.status(200).json({ success: true, message: "Folder renamed successfully." });
    } catch (error) {
        console.error("Error renaming folder in S3:", error);
        return res.status(500).json({ success: false, message: "Error renaming folder.", error: error.message });
    }
};
