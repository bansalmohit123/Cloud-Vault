import express from "express";
import { checkAPIStatus, generateSinglePresignedUrl, startMultipartUpload, generatePresignedUrls, completeMultipartUpload } from "./upload-handler";

const router = express.Router();

// Define routes
router.get("/", checkAPIStatus);
router.post("/generate-single-presigned-url", generateSinglePresignedUrl);
router.post("/start-multipart-upload", startMultipartUpload);
router.post("/generate-presigned-url", generatePresignedUrls);
router.post("/complete-multipart-upload", completeMultipartUpload);

export default router;
