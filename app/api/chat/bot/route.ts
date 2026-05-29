import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import Groq from "groq-sdk";
import { z } from "zod";
import { userGuard } from "@/lib/userGuards";
import { auth } from "@/auth";

// ─── 1. تعريف الـ Schemas ──────────────────────────────────
const GetMessagesSchema = z.object({
  cursor: z.string().optional(),
});

const PostMessageSchema = z.object({
  message: z.string().min(1, "الرسالة مطلوبة").trim(),
});

type GetMessagesInput = z.infer<typeof GetMessagesSchema>;
type PostMessageInput = z.infer<typeof PostMessageSchema>;

const groq = new Groq(); // بيقرأ GROQ_API_KEY من .env تلقائياً
const LIMIT = 10;

// ─── 2. منطق الـ GET (جلب الرسائل) ──────────────────────────
const getHandler = async (
  request: NextRequest,
  userId: string,
  data: GetMessagesInput,
) => {
  try {
    const { cursor } = data;
    const messages = await prisma.chatBotMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: LIMIT + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: { id: true, message: true, sender: true, createdAt: true },
    });

    const hasNextPage = messages.length > LIMIT;
    const resultData = hasNextPage ? messages.slice(0, LIMIT) : messages;
    const nextCursor =
      hasNextPage ? resultData[resultData.length - 1].id : null;

    return NextResponse.json({ messages: resultData, nextCursor });
  } catch (error) {
    return NextResponse.json({ error: "فشل جلب الرسائل" }, { status: 500 });
  }
};

// ─── 3. منطق الـ POST (Streaming مع Groq) ──────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. التحقق من البيانات المرسلة يدوياً بدل الـ Guard
    const body = await request.json();
    const validation = PostMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const data = validation.data;
    const userMessage = data.message;

    // 2. التحقق من وجود مستخدم مسجل (بدون منع "الهب والدب")
    const session = await auth();
    const userId = session?.user?.id;

    let history: { role: "user" | "assistant"; content: string }[] = [];

    // 3. التعامل مع الداتابيز: فقط إذا كان المستخدم مسجل
    if (userId) {
      const [recentMessages] = await Promise.all([
        prisma.chatBotMessage.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { message: true, sender: true },
        }),
        prisma.chatBotMessage.create({
          data: { message: userMessage, userId, sender: "USER" },
        }),
      ]);

      history = recentMessages.reverse().map((msg) => ({
        role: msg.sender === "USER" ? "user" : "assistant",
        content: msg.message,
      }));
    }

    // إضافة الرسالة الحالية للـ History (سواء فيه يوزر أو لأ)
    history.push({ role: "user", content: userMessage });

    // 4. استدعاء Groq
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
# ROLE: Z Fashion Assistant
You are the official AI representative of "Z Fashion", a world-class e-commerce store based in Egypt. Your goal is to provide a minimalist, professional, and helpful experience inspired by brands like Stripe and Linear.

# CONTEXT:
1. THE STORE: Z Fashion is a premium fashion platform focusing on high-performance tech (Next.js 15) and minimalist design. It features brands like "Heritage", "Core", and "Prestige".
2. THE DEVELOPER: Created by an elite Egyptian Full-stack Developer (Name of Developer Ebrahim Abozaid). The project is a "state-of-the-art" portfolio piece demonstrating 100% Lighthouse performance and interactive 3D elements.
3. THE VIBE:  modern,sleek, and high-end..

# CORE CONSTRAINTS (STRICT):
- ONLY discuss Z Fashion and the developer Ebrahim Abozaid. DO NOT answer questions about unrelated topics (e.g., general politics, other stores, or generic AI questions).
- LANGUAGE: Respond in the user's language (Fluent Egyptian Arabic or English).
- TONE:  friendly. Be  "SaaS-like".
- SECURITY: Never reveal internal database schemas or private code unless it's a general technical question about the store's performance.

# FREQUENTLY ASKED QUESTIONS (QUICK REPLIES):
- "حول مصمم المتجر وكيفيه التواصل معه": The store is developed by a professional Full-stack Developer from Egypt called Ebrahim Abozaid it (17 years old ). He specializes in building world-class SaaS-style web applications. Users can contact him through the official "Help Hub" or social links provided in the footer.
- "ما هو موقع ZFAShion": It is a premium Egyptian e-commerce destination that blends cutting-edge technology with high-end fashion. It aims to provide the smoothest shopping experience in the region.
# coonectio ingfo of ibrahim abozaid:
- LinkedIn: https://www.linkedin.com/in/ibrahim-abuzaid-9750b5404/
- Email: ebrahim.abozaid567@gmail.com
-phone: +201080761700
-whatsapp: +201080761700

- "ما اهم ما يميز هذا المتجر":
    - 1. High Performance (Ultra-fast loading).
    - 2. Minimalist UI/UX.
    - 3. Smart Filtering (by size, color, and brand).
    - 4. AI-driven support (You).

# INTERACTION STYLE:
- If a user asks a broad question, steer them back to shopping or the store's tech.
- If they ask for a recommendation, ask for their style (Heritage/Core/Prestige) or size (S to XL).
`,
        },
        ...history,
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullBotReply = "";
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullBotReply += content;
              controller.enqueue(encoder.encode(content));
            }
          }

          // 5. حفظ رد البوت في الداتابيز: فقط إذا كان هناك مستخدم مسجل
          if (fullBotReply && userId) {
            void prisma.chatBotMessage
              .create({
                data: { message: fullBotReply, userId, sender: "BOT" },
              })
              .catch((err) => console.error("Database save error:", err));
          }
        } catch (e) {
          console.error("Stream Error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("[CHATBOT_STREAM_ERROR]", error);
    return NextResponse.json(
      { error: "فشل الاتصال بمزود الخدمة" },
      { status: 500 },
    );
  }
}

export const GET = userGuard(GetMessagesSchema, getHandler);
