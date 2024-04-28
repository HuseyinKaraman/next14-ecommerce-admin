import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendVerificationEmail = async (
    email: string, 
    token: string
) => {
    const confirmLink = `${domain}/auth/new-verification?token=${token}`;

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Verify your email",
        html: `<p> Click <a href="${confirmLink}">Verify your email</a> to verify your email </p>`,
    });
};


export const sendPasswordResetPassword = async (
    email: string, 
    token: string
) => {
    const resetLink = `${domain}/auth/new-password?token=${token}`;

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset your password",
        html: `<p> Click <a href="${resetLink}">Verify your email</a>  to reset your password </p>`,
    });
};


export const sendTwoFactorTokenEmail = async (
    email: string, 
    token: string
) => {
   
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "2FA Code",
        html: `<p>Your 2FA code is ${token}</p>`,
    });
};
