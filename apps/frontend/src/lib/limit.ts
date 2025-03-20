'use server';
import { auth } from "../../auth";
import { prisma } from "./prisma";

export const checkUploadLimit = async () => {
  try {
    const session = await auth();
    console.log("Session:", session);
    if (!session || !session.user || !session.user.id) {
      console.error("Session invalid or user not authenticated:", session);
      throw new Error("User not authenticated");
    }

    const userId = session.user.id;
    const today = new Date();

    let userActivity;
    try {
      userActivity = await prisma.activity.findUnique({
        where: { userId: userId },
      });
    } catch (err) {
      console.error("Error fetching user activity:", err);
      throw err;
    }

    if (!userActivity) {
      // No activity, create new
      try {
        await prisma.activity.create({
          data: {
            userId,
            upload: 1,
            download: 0,
          },
        });
        console.log("Created new activity record");
        return true;
      } catch (err) {
        console.error("Error creating activity:", err);
        throw err;
      }
    }

    // Reset if date mismatch
    const updatedDate = new Date(userActivity.updatedAt);
    if (updatedDate.toDateString() !== today.toDateString()) {
      try {
        await prisma.activity.update({
          where: { userId },
          data: {
            upload: 1,
            download: 0,
          },
        });
        console.log("Activity reset for new day");
        return true;
      } catch (err) {
        console.error("Error resetting activity:", err);
        throw err;
      }
    }

    // Check limit
    if (userActivity.upload >= 3) {
      console.log("Upload limit reached");
      return false;
    }

    // Increment uploads
    try {
      await prisma.activity.update({
        where: { userId },
        data: { upload: { increment: 1 } },
      });
      console.log("Upload incremented");
      return true;
    } catch (err) {
      console.error("Error incrementing upload:", err);
      throw err;
    }
  } catch (err) {
    console.error("checkUploadLimit error:", err);
    throw err;
  }
};

export const rollbackUpload = async () => {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      console.error("Session invalid or user not authenticated:", session);
      throw new Error("User not authenticated");
    }

    const userId = session.user.id;

    let userActivity;
    try {
      userActivity = await prisma.activity.findUnique({
        where: { userId },
      });
    } catch (err) {
      console.error("Error fetching user activity for rollback:", err);
      throw err;
    }

    if (!userActivity || userActivity.upload <= 0) {
      console.error("No uploads to rollback");
      throw new Error("No uploads to rollback");
    }

    try {
      await prisma.activity.update({
        where: { userId },
        data: { upload: { decrement: 1 } },
      });
      console.log("Upload rollback successful");
    } catch (err) {
      console.error("Error during upload rollback:", err);
      throw err;
    }
  } catch (err) {
    console.error("rollbackUpload error:", err);
    throw err;
  }
};

export const checkAndIncrementDownload = async () => {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      console.error("Session invalid or user not authenticated:", session);
      throw new Error("User not authenticated");
    }

    const userId = session.user.id;
    const today = new Date();

    let userActivity;
    try {
      userActivity = await prisma.activity.findUnique({
        where: { userId },
      });
    } catch (err) {
      console.error("Error fetching user activity:", err);
      throw err;
    }

    if (!userActivity) {
      // No activity, create new
      try {
        await prisma.activity.create({
          data: {
            userId,
            upload: 0,
            download: 1,
          },
        });
        console.log("Created new activity record");
        return true;
      } catch (err) {
        console.error("Error creating activity:", err);
        throw err;
      }
    }

    // Reset if date mismatch
    const updatedDate = new Date(userActivity.updatedAt);
    if (updatedDate.toDateString() !== today.toDateString()) {
      try {
        await prisma.activity.update({
          where: { userId },
          data: {
            upload: 0,
            download: 1,
          },
        });
        console.log("Activity reset for new day");
        return true;
      } catch (err) {
        console.error("Error resetting activity:", err);
        throw err;
      }
    }

    // Check limit
    if (userActivity.download >= 3) {
      console.log("Download limit reached");
      return false;
    }

    // Increment downloads
    try {
      await prisma.activity.update({
        where: { userId },
        data: { download: { increment: 1 } },
      });
      console.log("Download incremented");
      return true;
    } catch (err) {
      console.error("Error incrementing download:", err);
      throw err;
    }
  } catch (err) {
    console.error("checkAndIncrementDownload error:", err);
    throw err;
  }
};
