import express from "express";
import { generatePresignedUrls, completeUpload } from "./upload-handler";

const router = express.Router();


router.post("/presigned-urls", generatePresignedUrls);
router.post("/complete-upload", completeUpload);

export default router;
