'use server';
import { prisma} from "./prisma";

export const createFolder = async (name: string, email: string, parentId: string | null) => {
  if (!email) {
    throw new Error("Email is required to create a folder.");
  }

  // Fetch user ID using the email
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User with the provided email does not exist.");
  }

  return await prisma.folder.create({
    data: {
      name,
      ownerId: user.id,
      parentId,
    },
  });
};

// Upload a file
export const uploadFile = async (
  name: string,
  type: string,
  size: number,
  ownerId: string,
  folderId: string,
  url: string
) => {
  return await prisma.file.create({
    data: {
      name,
      type,
      size,
      ownerId,
      folderId,
      url,
    },
  });
};

// Get a folder by ID
export const getFolder = async (folderId: string) => {
  return await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      subfolders: true,
      files: true,
    },
  });
};

export const getAllFoldersByOwner = async (email: string) => {
  // Fetch user ID using the email
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User with the provided email does not exist.");
  }

  // Fetch folders along with their subfolders and files
  const folders = await prisma.folder.findMany({
    where: { ownerId: user.id },
    include: {
      subfolders: true,
      files: true,
    },
  });

  // Fetch files with folderId null (root-level files)
  const rootFiles = await prisma.file.findMany({
    where: {
      folderId: null,
      ownerId: user.id,
    },
  });

  // Append root files to the final response
  console.log('folders', folders)
  console.log('rootFiles', rootFiles)
  return {
    folders,
    rootFiles,
  };
};


// // Get all folders by owner email
// export const getAllFoldersByOwner = async (email: string) => {
//   // Fetch user ID using the email
//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: { id: true },
//   });

//   if (!user) {
//     throw new Error("User with the provided email does not exist.");
//   }

//   return await prisma.folder.findMany({
//     where: { ownerId: user.id },
//     include: {
//       subfolders: true,
//       files: true,
//     },
//   });
// };

// Move a folder or file
export const moveItem = async (sourceId: string, destinationId: string | null) => {
  try {
    // Check if the source is a file
    const file = await prisma.file.findUnique({ where: { id: sourceId } });
    if (file) {
      return await prisma.file.update({
        where: { id: sourceId },
        data: { folderId: destinationId },
      });
    }

    // Check if the source is a folder
    const folder = await prisma.folder.findUnique({ where: { id: sourceId } });
    if (folder) {
      const isCircular = await checkCircularReference(sourceId, destinationId);
      if (isCircular) {
        throw new Error('Cannot move folder into its own subfolder');
      }

      return await prisma.folder.update({
        where: { id: sourceId },
        data: { parentId: destinationId },
      });
    }

    throw new Error('Source not found');
  } catch (error) {
    console.error('Move Item Error:', error);
    throw new Error('Failed to move item');
  }
};


// Helper: Check for circular references
const checkCircularReference = async (sourceId: string, destinationId: string | null): Promise<boolean> => {
  if (!destinationId) return false; // Moving to root is always valid

  let currentId = destinationId;

  while (currentId) {
    if (currentId === sourceId) return true; // Circular reference detected
    const parentFolder = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    currentId = parentFolder?.parentId as string;
  }

  return false; // No circular reference found
};
