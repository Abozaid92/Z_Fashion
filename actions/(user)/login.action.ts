"use server";

import { LoginFormData } from "@/app/[locale]/(user)/clientPart/login";
import { signIn } from "@/auth";
import { sendVerificationToken } from "@/lib/email";
import { generateVerificationToken } from "@/app/[locale]/utils/generateToken";
import { loginSchema } from "@/app/[locale]/utils/login";
import { headers } from "next/headers";
export const loginAction = async (data: LoginFormData, lang: string) => {
  try {
    const validation = loginSchema.safeParse(data);
    if (validation.success === false) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }

    // الكود ده هيرمي ايروو لو اليوزر مش متحقق بسبب الي احنا عاملينا في الكولباكس
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, message: result.error };
    }

    return { success: true, message: "Logged in successfully" };
  } catch (error: any) {
    if (
      error.type === "CredentialsSignin" ||
      error.code === "CredentialsSignin"
    ) {
      return { success: false, message: "CredentialsSignin" };
    }

    if (
      error.type === "AccessDenied" ||
      error.message?.includes("AccessDenied")
    ) {
      const userVerify = await generateVerificationToken(data.email);
      await sendVerificationToken(userVerify.email, userVerify.token, lang);
      return { success: false, message: "AccessDenied" };
    }

    console.error("Auth Action Error:", error);
    return { success: false, message: "SomethingWentWrong" };
  }
};
