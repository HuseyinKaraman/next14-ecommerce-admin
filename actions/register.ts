"use server";

import * as z from "zod";
import bcryptjs from "bcryptjs";

import { RegisterSchema } from "@/schemas";
import { prismadb } from "@/lib/prismadb";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
	const validatedFields = RegisterSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid fields" };
	}

	const {email, password, name} = validatedFields.data;
	const hashedPassword = await bcryptjs.hash(password, 10);

	const existingUser = await getUserByEmail(email);

	if (existingUser) {
		return { error: "User already in use" };
	}

	await prismadb.user.create({
		data:{
			name,
			email,
			password: hashedPassword,
		}
	})

	const verificationToken = await generateVerificationToken(email);
	
	await sendVerificationEmail(
		verificationToken.email,
		verificationToken.token
	);

	return {success: "Confirmation email sent!"};
};
