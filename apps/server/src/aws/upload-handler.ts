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

dotenv.config();



const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.S3_ENDPOINT,
});

export const generatePresignedUrls = async (req, res) => {
  try {
    const { fileName, fileType, fileSize, folderId } = req.body;

    if (!fileName || !fileType || !fileSize) {
      return res.status(400).json({ error: "Missing required parameters" });
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
      return res.json({ presignedUrls: [presignedUrl], uploadId: null });
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
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: key,
              PartNumber: index + 1,
              UploadId,
            }),
            { expiresIn: 3600 }
          )
        )
      );

      return res.json({ presignedUrls, uploadId: UploadId });
    }
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    res.status(500).json({ error: "Error generating presigned URLs" });
  }
};


export const completeUpload = async (req, res) => {
  try {
    const { fileName, uploadId, parts, folderId, userId } = req.body;

    if (!fileName || !uploadId || !parts || !userId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: folderId ? `${folderId}/${fileName}` : fileName,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });
    await s3Client.send(completeCommand);

  }
  catch (error) {
    console.error("Error completing upload:", error);
    res.status(500).json({ error: "Error completing upload" });
  }
};