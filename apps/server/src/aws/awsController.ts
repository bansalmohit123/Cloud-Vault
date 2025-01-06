import { GetObjectCommand } from "@aws-sdk/client-s3";
import archiver from "archiver";
import prisma from "../prisma";
import { Response, Request } from "express";
import dotenv from "dotenv";
import { Readable } from "stream";
import s3Client from "../s3client";

dotenv.config();


export const streamFolderAsZip = async (folderId: string, res: Response) => {
  try {
    // Fetch all files in the folder from the database
    const files = await prisma.file.findMany({ where: { folderId } });

    if (!files.length) {
      throw new Error("No files found in the folder.");
    }

    // Set response headers for zip download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${folderId}.zip"`);

    // Create a ZIP archive stream
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (const file of files) {
      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `${folderId}/${file.name}`, // Assuming S3 key structure is folderId/filename
      });

      // Get the S3 object as a readable stream
      const s3Response = await s3Client.send(getObjectCommand);
      const s3Stream = s3Response.Body as Readable;

      // Append file to the archive
      archive.append(s3Stream, { name: file.name });
    }

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error("Error streaming folder as ZIP:", error);
    res.status(500).send("Failed to download folder as ZIP.");
  }
};


export const downloadFolderHandler = async (req: Request, res: Response) => {
  const { folderId } = req.params;
  console.log("folderId", folderId);

  try {
    await streamFolderAsZip(folderId, res);
  } catch (error) {
    console.error("Error in folder download:", error);
    res.status(500).send("Failed to download folder.");
  }
};

