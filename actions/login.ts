"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { prismadb } from "@/lib/prismadb";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { getUserByEmail } from "@/data/user";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { 
    sendVerificationEmail, 
    sendTwoFactorTokenEmail 
} from "@/lib/mail";
import {
    generateVerificationToken,
    generateTwoFactorToken,
} from "@/lib/tokens";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

export const login = async (
    values: z.infer<typeof LoginSchema>,
    callbackUrl?: string | null   
) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { email, password, code } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.password || !existingUser.email) {
        return { error: "Email does not exist" };
    }

    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(
            existingUser.email
        );

        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token
        );

        return { success: "Confirmation email sent!" };
    }

    if (existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            const existingToken = await getTwoFactorTokenByEmail(existingUser.email);
            if (!existingToken) {
                return { error: "Invalid code!" };
            }
            
            if (existingToken.token !== code) {
                return { error: "Invalid code!" };
            }

            const hasExpired = new Date(existingToken.expires) < new Date();
            if (hasExpired) {
                return { error: "Token has expired" };
            }
            
            await prismadb.twoFactorToken.delete({
                where: { id: existingToken.id }
            })
            
            const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
            if (existingConfirmation) {
                await prismadb.twoFactorConfirmation.delete({
                    where: { id: existingConfirmation.id }
                })
            }

            await prismadb.twoFactorConfirmation.create({
                data: {
                    userId: existingUser.id
                }
            })
        } else {
            const twoFactorToken = await generateTwoFactorToken(
                existingUser.email
            );

            await sendTwoFactorTokenEmail(
                twoFactorToken.email,
                twoFactorToken.token
            );

            return { twoFactor: true };
        }
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" };
                default:
                    return { error: "Something went wrong" };
            }
        }

        throw error;
    }
};
