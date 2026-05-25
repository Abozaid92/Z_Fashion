import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import authConfig from "./auth.config";
import prisma from "./lib/db";
import { Role } from "@prisma/client";
import { getCountryByIp } from "./lib/getCountryBy_IP";
import redisClient from "./lib/redisClient";
export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async jwt({ token }) {
      //
      return token;
    },
    // include id in session and include role(we created it in prisma )
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        const userFavorites = await prisma.user.findUnique({
          where: {
            id: session.user.id,
          },

          include: {
            favorite: {
              select: {
                productId: true,
              },
            },
          },
        });
        if (!userFavorites) {
          throw new Error("access deny, user havnot foavourite");
        }
        session.user.role = token.role as Role;
        // الي فوق مشتغلتش فعمت دي
        session.user.role = userFavorites.role;
        session.user.country = userFavorites.country;
        session.user.favorites = userFavorites?.favorite.map(
          (el) => el.productId,
        );
      }
      //
      return session;
    },
    // if user didn;t verify his email
    async signIn({ user, account }) {
      const country = await getCountryByIp();
      try {
        redisClient
          .hIncrBy("stats:total:allStats", "totalUsers", 1)
          .catch((err) => console.error("Redis Incr Error:", err));
      } catch (e) {
        console.error("Redis incre totalUsers err Error:", e);
      }
      // 2. تحديث الدولة في الداتابيز (تعمل مع جوجل، جيت هاب، وأيضاً الكريدينشالز)
      if (user.id) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: { country: country },
          })
          .catch(() => {});
      }
      if (account?.provider !== "credentials") {
        return true;
      }
      const userFromDb = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (!userFromDb?.emailVerified) {
        return false;
      }
      // 1. جلب الدولة خفية

      return true;
    },
  },
  // (email verified === nul) when i make login by provider(foofle,facebook,etc)
  // this event to  put value in email cerified
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },

  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
