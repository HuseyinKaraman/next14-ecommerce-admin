"use server";

import * as z from "zod";
import bcryptjs from "bcryptjs";

import { NewPasswordSchema } from "@/schemas";
import { prismadb } from "@/lib/prismadb";
import { getUserByEmail } from "@/data/user";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";

export const newPassword = async (
    values: z.infer<typeof NewPasswordSchema>,
    token?: string | null
) => {
    if (!token) {
        return { error: "Missing token!" };
    }

    const validatedFields = NewPasswordSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { password, confirmPassword } = validatedFields.data;
    if (password !== confirmPassword) {
        return { error: "Passwords do not match!" };
    }

    const existingToken = await getPasswordResetTokenByToken(token);
    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await prismadb.user.update({
        where: { id: existingUser.id },
        data: {
            password: hashedPassword,
        },
    });

    await prismadb.passwordResetToken.delete({ where: { id: existingToken.id } });

    return { success: "Password changed!" };
};
