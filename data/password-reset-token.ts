import prismadb from "@/lib/prismadb";

export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await prismadb.passwordResetToken.findUnique({ 
            where: { token }
        });

        return passwordResetToken;
    } catch (error) {
        return null;
    }
};


export const getPasswordResetTokenByEmail = async (email: string) => {
    try {
        const passwordResetToken = await prismadb.passwordResetToken.findFirst({ 
            where: { email }
        });

        return passwordResetToken;
    } catch (error) {
        return null;
    }
};
