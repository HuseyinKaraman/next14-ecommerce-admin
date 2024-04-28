"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { ResetPasswordSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetPassword } from "@/lib/mail";

export const resetPassword = async (values: z.infer<typeof ResetPasswordSchema>) => {
    const validatedFields = ResetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid email!" };
    }

    const { email } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
        return { error: "Email not found" };
    }
    
    if (!existingUser.password) {
        return { error: "Email already in use with provider" };
    }

    // TODO: Generate token and send email
    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetPassword(
        passwordResetToken.email, 
        passwordResetToken.token
    );

    return { success: "Password reset email sent!" };
};
