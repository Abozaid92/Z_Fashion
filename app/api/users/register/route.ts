import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/app/[locale]/utils/register";
import prisma from "@/lib/db";
import { generateVerificationToken } from "@/app/[locale]/utils/generateToken";
import { sendVerificationToken } from "@/lib/email";
import { getCountryByIp } from "@/lib/getCountryBy_IP"; // استيراد الفانكشن

/**
 * @method POST
 * @description Register a new user
 * @route /api/users/register
 * @access public
 * */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(result.error.flatten().fieldErrors, {
        status: 400,
      });
    }

    const { email, name, password } = result.data;

    const userExist = await prisma.user.findFirst({
      where: { OR: [{ email }, { name }] },
    });

    if (userExist) {
      const isEmail = userExist.email === email;
      return NextResponse.json(
        {
          message: isEmail ? "Email is already taken" : "Name is already taken",
        },
        { status: 409 },
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // --- الجزء الخاص بتحديد الدولة ---
    // بنجيب الدولة قبل ما ننشئ اليوزر عشان نخزنها معاه فوراً
    const country = await getCountryByIp();

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        country: country,
      },
    });

    const { password: _, ...userResponse } = newUser;

    const verifyToken = await generateVerificationToken(email);
    // ملحوظة: ممكن تمرر الـ locale من الـ Request بدل "en" ثابتة لو حبيت
    sendVerificationToken(verifyToken.email, verifyToken.token, "en");

    return NextResponse.json(
      { data: userResponse, message: "ُEmail Sent. Verify Your Account" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
