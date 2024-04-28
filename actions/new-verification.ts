"use server"

import { prismadb } from "@/lib/prismadb";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";


export const newVerification = async (token: string) => {
    
    const existingToken = await getVerificationTokenByToken(token);
    if (!existingToken) {
        return {error: "Token does not exist"}
    }

    const hasExpired = new Date(existingToken.expires) < new Date() ;
    if (hasExpired) {
        return {error: "Token has expired"}
    }

    const user = await getUserByEmail(existingToken.email);
    if (!user) {
        return {error: "Email does not exist"}
    }

    await prismadb.user.update({
        where: { id: user.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.email // if email has changed , we need to update
        }
    })

    await prismadb.verificationToken.delete({
        where: { id: existingToken.id }
    });

    return { success: "Email verified!" }
}