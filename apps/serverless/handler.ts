import {
    S3Client,
    CreateMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    UploadPartCommand,
    PutObjectCommand,
    GetObjectCommand,
  } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import dotenv from "dotenv";
  import s3Client from "./s3client";
  
  dotenv.config();
  
  // Generate presigned URL for downloading a file
  export const generatePresignedURLget = async (event) => {
    try {
      const { fileName, folderId, expiresIn } = JSON.parse(event.body);
  
      if (!fileName) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required parameters" }),
        };
      }
  
      const key = folderId ? `${folderId}/${fileName}` : fileName;
  
      const presignedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
        }),
        { expiresIn: expiresIn || 7200 }
      );
  
      return {
        statusCode: 200,
        body: JSON.stringify({ presignedUrl }),
      };
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error generating presigned URL" }),
      };
    }
  };
  
  // Generate presigned URLs for uploading (single-part and multi-part)
  export const generatePresignedUrls = async (event) => {
    try {
      const { fileName, fileType, fileSize, folderId } = JSON.parse(event.body);
  
      if (!fileName || !fileType || !fileSize) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required parameters" }),
        };
      }
  
      const key = folderId ? `${folderId}/${fileName}` : fileName;
      const chunkSize = 10 * 1024 * 1024; // 10 MB
  
      if (fileSize <= chunkSize) {
        // Single-part upload
        const presignedUrl = await getSignedUrl(
          s3Client,
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
          }),
          { expiresIn: 3600 }
        );
        return {
          statusCode: 200,
          body: JSON.stringify({ presignedUrls: [presignedUrl], uploadId: null }),
        };
      } else {
        // Multipart upload
        const startCommand = new CreateMultipartUploadCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
        });
        const { UploadId } = await s3Client.send(startCommand);
  
        const totalChunks = Math.ceil(fileSize / chunkSize);
        const presignedUrls = await Promise.all(
          Array.from({ length: totalChunks }, (_, index) =>
            getSignedUrl(
              s3Client,
              new UploadPartCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key,
                PartNumber: index + 1,
                UploadId,
              }),
              { expiresIn: 3600 }
            )
          )
        );
  
        return {
          statusCode: 200,
          body: JSON.stringify({ presignedUrls, uploadId: UploadId }),
        };
      }
    } catch (error) {
      console.error("Error generating presigned URLs:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error generating presigned URLs" }),
      };
    }
  };
  
  // Complete multipart upload
  export const completeUpload = async (event) => {
    try {
      const { fileName, uploadId, parts, folderId, userId } = JSON.parse(event.body);
  
      if (!fileName || !uploadId || !parts || !userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required parameters" }),
        };
      }
  
      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: folderId ? `${folderId}/${fileName}` : fileName,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      });
      await s3Client.send(completeCommand);
  
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Upload completed successfully" }),
      };
    } catch (error) {
      console.error("Error completing upload:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error completing upload" }),
      };
    }
  };
  