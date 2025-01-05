import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import s3Client from "./s3client";

dotenv.config();

export const renameFileHandler = async (event) => {
  const body = JSON.parse(event.body);
  const { oldKey, newName } = body;

  if (!oldKey || !newName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "Missing oldKey or newName." }),
    };
  }

  try {
    const newKey = oldKey.replace(/[^/]+$/, newName);

    // Step 1: Copy the file to the new key
    const copyCommand = new CopyObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      CopySource: `${process.env.AWS_S3_BUCKET_NAME}/${oldKey}`,
      Key: newKey,
    });
    await s3Client.send(copyCommand);

    // Step 2: Delete the old file
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: oldKey,
    });
    await s3Client.send(deleteCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "File renamed successfully.", newKey }),
    };
  } catch (error) {
    console.error("Error renaming file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Failed to rename file.", error: error.message }),
    };
  }
};

export const deleteFileHandler = async (event) => {
  const body = JSON.parse(event.body);
  const { s3Key } = body;

  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, s3Key }),
    };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Failed to delete file." }),
    };
  }
};

export const deleteFolderHandler = async (event) => {
  const body = JSON.parse(event.body);
  const { s3Key } = body;

  if (!s3Key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "Missing folder S3 key." }),
    };
  }

  try {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: s3Key,
    });

    const listResponse = await s3Client.send(listObjectsCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: "No objects found in the folder." }),
      };
    }

    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects: listResponse.Contents.map((item) => ({ Key: item.Key })),
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    const deleteResponse = await s3Client.send(deleteCommand);

    if (deleteResponse.Errors && deleteResponse.Errors.length > 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: "Failed to delete some or all objects in the folder.",
          errors: deleteResponse.Errors,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Folder and its contents deleted successfully." }),
    };
  } catch (error) {
    console.error("Error deleting folder:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Error deleting folder.", error: error.message }),
    };
  }
};

export const renameFolderHandler = async (event) => {
  const body = JSON.parse(event.body);
  const { folderId, newName } = body;

  if (!folderId || !newName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "Missing folderId or newName." }),
    };
  }

  try {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: `${folderId}/`,
    });

    const listResponse = await s3Client.send(listObjectsCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: "No objects found in the folder." }),
      };
    }

    await Promise.all(
      listResponse.Contents.map(async (object) => {
        if (!object.Key) {
          throw new Error("Object key is undefined");
        }

        const newKey = object.Key.replace(`${folderId}/`, `${newName}/`);
        const copyCommand = new CopyObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          CopySource: `${process.env.AWS_S3_BUCKET_NAME}/${object.Key}`,
          Key: newKey,
        });

        await s3Client.send(copyCommand);
      })
    );

    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects: listResponse.Contents.map((item) => ({ Key: item.Key })),
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await s3Client.send(deleteCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Folder renamed successfully." }),
    };
  } catch (error) {
    console.error("Error renaming folder:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Error renaming folder.", error: error.message }),
    };
  }
};
