"use server";

import { generateForget_PasswrdToken } from "@/app/[locale]/utils/generateToken";
import { sendForget_passwordToken } from "@/lib/emailFogerPass";
import prisma from "@/lib/db";
import { emailschema } from "@/app/[locale]/utils/forget_reset_Password";
export const forgetPassword = async (email: string, lang: string | null) => {
  try {
    const validation = emailschema.safeParse({ email: email });
    if (validation.success === false) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }
    const forgetPassword = await generateForget_PasswrdToken(email);

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return { success: false, message: "user Not Found" };
    }
    await sendForget_passwordToken(
      forgetPassword.email,
      forgetPassword.token,
      lang,
    );
    return {
      success: true,
      message: "we sent verifivation link to your email",
    };
  } catch (err) {
    return { success: false, message: "something went wrong" };
  }
};
