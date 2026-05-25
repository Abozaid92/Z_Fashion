import z from "zod";

export const getChatRoomSchema = z.object({
  chatRoomNumber: z.coerce.number().optional().default(1),
});
