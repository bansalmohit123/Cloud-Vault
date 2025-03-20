import express from "express";
import { generatePresignedUrls, completeUpload , generatePresignedURLget} from "./upload-handler";

const router = express.Router();


router.post("/presigned-urls", generatePresignedUrls);
router.post("/complete-upload", completeUpload);
router.post("/get-file", generatePresignedURLget);

export default router;
