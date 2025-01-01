import { Router} from "express";
import { copyObject, deleteObject, getObjectURL, listObjects, putObject } from "./awsController";



const awsRoutes = Router();

awsRoutes.post("/getObject",async (req, res) => {
        const { path } = req.body;

        // Validate the path
        if (!path || typeof path !== "string") {
            return res.status(400).json({ error: "Path is required and must be a string" });
        }

        try {
            const url = await getObjectURL(path);
            return res.status(200).json({ url });
        } catch (error) {
            return res.status(500).json({ error: "Failed to get object URL" });
        }
    });

awsRoutes.post("/putObject",async (req, res) => {
        const { filename, contentType } = req.body;

        // Validate the filename and contentType
        if (!filename || typeof filename !== "string" || !contentType || typeof contentType !== "string") {
            return res.status(400).json({ error: "Filename and contentType are required and must be strings" });
        }

        try {
            const url = await putObject(filename, contentType);
            return res.status(200).json({ url });
        } catch (error) {
            return res.status(500).json({ error: "Failed to put object" });
        }
    }  
);
awsRoutes.post("/moveObject", async (req, res) => {
    const { sourceKey, destinationKey } = req.body;

    // Validate input
    if (
        !sourceKey || typeof sourceKey !== "string" ||
        !destinationKey || typeof destinationKey !== "string"
    ) {
        return res.status(400).json({ error: "SourceKey and DestinationKey are required and must be strings" });
    }

    try {
        // Step 1: Copy the object to the new location
        await copyObject(
            sourceKey,
            destinationKey
        );

        // Step 2: Delete the object from the old location
        await deleteObject(
           sourceKey
        )

        // Step 3: Return the new URL or success message
        // const newUrl = https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${destinationKey};
        return res.status(200).json({ message: "Object moved successfully" });
    } catch (error) {
        console.error("Error moving object:", error);
        return res.status(500).json({ error: "Failed to move object" });
    }
});

awsRoutes.post("/deleteObject",async (req, res) => {
        const { path } = req.body;

        // Validate the path
        if (!path || typeof path !== "string") {
            return res.status(400).json({ error: "Path is required and must be a string" });
        }

        try {
            const result = await deleteObject(path);
            return res.status(200).json({ result });
        } catch (error) {
            return res.status(500).json({ error: "Failed to delete object" });
        }
    });
awsRoutes.post("/listObjects",async (req, res) => {
        const { path } = req.body;

        // Validate the path
        if (!path || typeof path !== "string") {
            return res.status(400).json({ error: "Path is required and must be a string" });
        }

        try {
            const result = await listObjects(path);
            return res.status(200).json({ result });
        } catch (error) {
            return res.status(500).json({ error: "Failed to list objects" });
        }
    });

export default awsRoutes;