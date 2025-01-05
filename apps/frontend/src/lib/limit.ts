'use server';
import { auth } from "../../auth";
import { prisma } from "./prisma";

export const checkUploadLimit = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const today = new Date();
  const userActivity = await prisma.activity.findUnique({
    where: { userId: session.user.id },
  });

  if (!userActivity) {
    // Create a new record if none exists
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        upload: 1,
        download: 0,
      },
    });
    return true; // Upload allowed
  }

  // Reset uploads/downloads if `updatedAt` is not today's date
  const updatedDate = new Date(userActivity.updatedAt);
  if (updatedDate.toDateString() !== today.toDateString()) {
    await prisma.activity.update({
      where: { userId: session.user.id },
      data: {
        upload: 1, // Reset uploads and set to 1
        download: 0, // Reset downloads
      },
    });
    return true; // Upload allowed
  }

  // Check if upload limit is reached
  if (userActivity.upload >= 3) {
    return false; // Upload limit reached
  }

  // Increment uploads
  await prisma.activity.update({
    where: { userId: session.user.id },
    data: { upload: { increment: 1 } },
  });

  return true; // Upload allowed
};

export const rollbackUpload = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const userActivity = await prisma.activity.findUnique({
    where: { userId: session.user.id },
  });

  if (!userActivity || userActivity.upload <= 0) {
    throw new Error("No uploads to rollback");
  }

  // Decrement uploads
  await prisma.activity.update({
    where: { userId: session.user.id },
    data: { upload: { decrement: 1 } },
  });
};

export const checkAndIncrementDownload = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const today = new Date();
  const userActivity = await prisma.activity.findUnique({
    where: { userId: session.user.id },
  });

  if (!userActivity) {
    // Create a new record if none exists
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        upload: 0,
        download: 1,
      },
    });
    return true; // Download allowed
  }

  // Reset uploads/downloads if `updatedAt` is not today's date
  const updatedDate = new Date(userActivity.updatedAt);
  if (updatedDate.toDateString() !== today.toDateString()) {
    await prisma.activity.update({
      where: { userId: session.user.id },
      data: {
        upload: 0, // Reset uploads
        download: 1, // Reset downloads and set to 1
      },
    });
    return true; // Download allowed
  }

  // Check if download limit is reached
  if (userActivity.download >= 3) {
    return false; // Download limit reached
  }

  // Increment downloads
  await prisma.activity.update({
    where: { userId: session.user.id },
    data: { download: { increment: 1 } },
  });

  return true; // Download allowed
};
