import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().min(1).email(),
  name: z.string().min(3).max(20),
  password: z.string().min(6),
});
