"use server";
import prisma from "@/lib/db";

export const verifyToken = async (token: string) => {
  const verifyToken = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!verifyToken) {
    return { success: false, message: "token not found" };
  }
  const isExpired = new Date(verifyToken.expires) < new Date();
  if (isExpired) {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token },
    });
    if (verificationToken) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
    }

    return { success: false, message: "token is expierd" };
  }
  const user = await prisma.user.findUnique({
    where: {
      email: verifyToken.email,
    },
  });
  if (!user) {
    return { success: false, message: "user not found" };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
    },
  });

  return { success: true, message: "verified succesfully" };
};
