import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Handler<T> = (
  req: NextRequest,
  userId: string,
  data: T
) => Promise<NextResponse>;

/**
 * Wraps a Next.js route handler with:
 *  1. Authentication check (verify session / JWT — adapt to your auth provider)
 *  2. Input validation via a Zod schema
 *  3. Role enforcement (ADMIN only)
 *
 * Usage:
 *   export const GET = adminGuard(mySchema, myHandler);
 */
export function adminGuard<T>(
  schema: z.ZodSchema<T>,
  handler: Handler<T>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // ── 1. Auth ──────────────────────────────────────────────────────────
    // Replace this block with your real session/JWT verification.
    // e.g. using next-auth:
    //   const session = await getServerSession(authOptions);
    //   if (!session || session.user.role !== "ADMIN") { ... }
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized — no user id" },
        { status: 401 }
      );
    }

    // ── 2. Validation ────────────────────────────────────────────────────
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = schema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // ── 3. Delegate ──────────────────────────────────────────────────────
    return handler(req, userId, parsed.data);
  };
}
