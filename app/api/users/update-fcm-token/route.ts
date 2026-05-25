import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { userGuard } from "@/lib/userGuards";
import redisClient from "@/lib/redisClient";
/**
 * @method PATCH
 * @description إضافة توكن الإشعارات لقائمة المستخدم
 * @route /api/admin/users/update-fcm-token
 * @access Private (المستخدمين المسجلين فقط)
 */

// 1. تعريف الـ Schema لفحص البيانات القادمة (Token)
const FcmTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// 2. كتابة الـ Logic الأساسي (بدون تكرار كود الحماية)
// لاحظ إننا استقبلنا userId و data جاهزين من الجارد
const updateFcmHandler = async (
  req: NextRequest,
  userId: string,
  data: z.infer<typeof FcmTokenSchema>,
  role: string,
) => {
  if (role === "ADMIN") {
    try {
      await redisClient.sAdd("admin:fcm_tokens", data.token);
    } catch (error) {
      // console.log("error in update fcm token redis", error);
    }
  }
  // هنا أنت متأكد إن الـ userId موجود والـ token سليم
  await prisma.pushToken.upsert({
    where: { token: data.token },
    update: { userId: userId },
    create: {
      token: data.token,
      userId: userId,
    },
  });

  return NextResponse.json({ success: true });
};

// 3. تغليف الـ Function وتصديرها كـ PATCH
// الجارد هنا هو اللي هيعمل الـ auth والـ Rate Limit والـ Zod Validation
export const PATCH = userGuard(FcmTokenSchema, updateFcmHandler);
