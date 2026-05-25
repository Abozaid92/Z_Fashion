"use server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { passwordSchema } from "@/app/[locale]/utils/forget_reset_Password";
export const resetPassword = async (token: string | null, password: string) => {
  try {
    if (!token)
      return {
        success: false,
        message: "token not found",
      };

    const validation = passwordSchema.safeParse({ password: password });
    if (validation.success === false) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }
    const resetPasswordToken = await prisma.forgetPassword.findFirst({
      where: { token: token },
    });
    if (!resetPasswordToken)
      return {
        success: false,
        message: "token not found",
      };
    const isExpired = new Date(resetPasswordToken.expires) < new Date();
    if (isExpired) {
      return { success: false, message: "token is expierd" };
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: resetPasswordToken?.email },
        data: {
          password: hashPassword,
        },
      });
      // await
      if (resetPasswordToken) {
        await tx.forgetPassword.delete({
          where: { id: resetPasswordToken.id },
        });
      }
    });

    return { success: true, message: "password change successfully" };
  } catch (error) {
    return { success: false, message: "something went wrong" };
  }
};
