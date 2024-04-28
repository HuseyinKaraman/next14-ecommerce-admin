import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

// https://authjs.dev/getting-started/typescript?frameworks=next#module-augmentation
declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}