"use server";

import { db } from "@/lib/db";

export const grantAccess = async (userId: string, levels: string[]) => {
  try {
    const existingAccess = await db.access.findFirst({
      where: { userId: userId },
    });
    
    if (existingAccess) {
      const updatedAccess = await db.access.update({
        where: { id: existingAccess.id },
        data: {
          levels: levels,
        },
      });
      return updatedAccess;
    } else {
      const createdAccess = await db.access.create({
        data: {
          userId: userId,
          levels: levels,
        },
      });
      return createdAccess;
    }
  } catch (error) {
    return { error: "Failed to grant access" };
  }
};

export const getAccess = async (userId: string) => {
  try {
    const access = await db.access.findFirst({
      where: { userId: userId },
    });

    if (!access) {
      return { error: "Access not found" };
    }

    return { success: "Access retrieved successfully", access };
  } catch (error) {
    return { error: "Failed to get access" };
  }
};
