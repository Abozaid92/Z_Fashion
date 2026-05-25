import z from "zod";

export const messageSchema = z.object({
  message: z.string(),
  userId: z.string(),
  roomId: z.string(),
});
export type messageType = z.infer<typeof messageSchema>;
