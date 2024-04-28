"use server";

import * as z from "zod";
import bcryptjs from "bcryptjs";

import { prismadb } from "@/lib/prismadb";
import { SettingsSchema } from "@/schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
    const user = await currentUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    const dbUser = await getUserById(user.id!);
    if (!dbUser) {
        return { error: "Unauthorized" };
    }

    if (user.isOAuth) {
        // not allowed for OAuth users
        values.email = undefined;
        values.isTwoFactorEnabled = undefined;
        values.password = undefined;
        values.newPassword = undefined;
    }

    if (values.email && values.email !== user.email) {
        const existingUser = await getUserByEmail(values.email);

        if (existingUser && existingUser.id !== user.id) {
            return { error: "Email already in use" };
        }

        const verificationToken = await generateVerificationToken(values.email);
        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token
        );

        return { success: "Verification email sent!" };
    }

    if (values.newPassword && values.password && dbUser.password) {
        const passwordsMatch = await bcryptjs.compare(
            values.password,
            dbUser.password
        );

        if (!passwordsMatch) {
            return { error: "Incorrect password!" };
        }

        const hashedPassword = await bcryptjs.hash(values.newPassword, 10);
        values.password = hashedPassword;
        values.newPassword = undefined;
    }

    await prismadb.user.update({
        where: {
            id: user.id,
        },
        data: {
            ...values,
        },
    });

    return { success: "Settings updated!" };
};
