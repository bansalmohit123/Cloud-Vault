import e from "express";
import prisma from "../prisma";

export const createFolder = async (req: e.Request, res: e.Response) => {
    const { name, ownerId, parentId } = req.body;
    try {
        const folder = await prisma.folder.create({
            data: {
                name,
                ownerId,
                parentId: parentId || null,
            },
        });
        res.status(201).json(folder);
    } catch (error) {
        console.error("Error creating folder:", error);
        res.status(500).json({ error: "Error creating folder" });
    }
};

export const uploadFile = async (req: e.Request, res: e.Response) => {
    const { name, type, size, ownerId, folderId, url } = req.body;
    try {
        const file = await prisma.file.create({
            data: {
                name,
                type,
                size,
                ownerId,
                folderId,
                url,
            },
        });
        res.status(201).json(file);
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Error uploading file" });
    }
};

export const getFolder = async (req: e.Request, res: e.Response) => {
    const { folderId } = req.params;
    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            include: {
                subfolders: true,
                files: true,
            },
        });
        if (folder) {
            res.status(200).json(folder);
        } else {
            res.status(404).json({ error: "Folder not found" });
        }
    } catch (error) {
        console.error("Error fetching folder:", error);
        res.status(500).json({ error: "Error fetching folder" });
    }
};

export const getFolders = async (req: e.Request, res: e.Response) => {
    const { parentId } = req.params;
    try {
        const folders = await prisma.folder.findMany({
            where: { parentId: parentId as string },
            include: {
                subfolders: true,
                files: true,
            },
        });
        res.status(200).json(folders);
    } catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ error: "Error fetching folders" });
    }
};
export const getAllFoldersByOwner = async (req: e.Request, res: e.Response) => {
    const { ownerId } = req.params;
    try {
        const folders = await prisma.folder.findMany({
            where: { ownerId: ownerId as string },
            include: {
                subfolders: true,
                files: true,
            },
        });
        res.status(200).json(folders);
    } catch (error) {
        console.error("Error fetching folders by owner:", error);
        res.status(500).json({ error: "Error fetching folders by owner" });
    }
};


export const Move =  async (req: e.Request, res: e.Response) => {
    const { sourceId, destinationId } = req.body;
  
    try {
      // Check if source is a file
      const file = await prisma.file.findUnique({
        where: { id: sourceId },
      });
  
      if (file) {
        // Validate destination (must be a folder or null for root)
        if (destinationId) {
          const destinationFolder = await prisma.folder.findUnique({
            where: { id: destinationId },
          });
          if (!destinationFolder) {
            return res.status(404).json({ error: 'Destination folder not found' });
          }
        }
  
        // Update file's folderId
        const updatedFile = await prisma.file.update({
          where: { id: sourceId },
          data: { folderId: destinationId },
        });
  
        return res.status(200).json({ message: 'File moved successfully', file: updatedFile });
      }
  
      // Check if source is a folder
      const folder = await prisma.folder.findUnique({
        where: { id: sourceId },
      });
  
      if (folder) {
        // Validate destination (must be a folder or null for root)
        if (destinationId) {
          const destinationFolder = await prisma.folder.findUnique({
            where: { id: destinationId },
          });
          if (!destinationFolder) {
            return res.status(404).json({ error: 'Destination folder not found' });
          }
  
          // Prevent circular references (a folder cannot be moved into itself or its subfolders)
          const isCircular = await checkCircularReference(sourceId, destinationId);
          if (isCircular) {
            return res.status(400).json({ error: 'Cannot move folder into its own subfolder' });
          }
        }
  
        // Update folder's parentId
        const updatedFolder = await prisma.folder.update({
          where: { id: sourceId },
          data: { parentId: destinationId },
        });
  
        return res.status(200).json({ message: 'Folder moved successfully', folder: updatedFolder });
      }
  
      return res.status(404).json({ error: 'Source not found' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while moving the file or folder' });
    }
  };
  
  // Helper function to check for circular references
  async function checkCircularReference(sourceId, destinationId) {
    let currentFolderId = destinationId;
  
    while (currentFolderId) {
      if (currentFolderId === sourceId) {
        return true;
      }
  
      const parentFolder = await prisma.folder.findUnique({
        where: { id: currentFolderId },
      });
  
      currentFolderId = parentFolder?.parentId || null;
    }
  
    return false;
  }
  