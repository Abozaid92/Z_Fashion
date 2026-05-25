// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { registerSchema } from "./app/[locale]/utils/register";
import { loginSchema } from "./app/[locale]/utils/login";
import bycrypt from "bcryptjs";
// providers
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export default {
  providers: [
    Credentials({
      async authorize(data) {
        const validatiom = loginSchema.safeParse(data);
        if (validatiom.success) {
          const { password, email } = validatiom.data;
          const user = await prisma?.user.findFirst({
            where: {
              email: email,
            },
          });
          if (!user || !user.password) return null;
          const comparePassword = await bycrypt.compare(
            password,
            user.password,
          );
          if (comparePassword) return user;
        }
        return null;
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
} satisfies NextAuthConfig;
