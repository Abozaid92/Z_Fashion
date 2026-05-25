import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number(),
  limit: z.coerce.number(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  backgroundColor: z.string().default("#000000"),
  // الـ textColor في السكيما عندك بياخد ديفولت RGBA، فخلينا نقبله كـ string
  textColor: z.string().default("rgba(27, 26, 26, 1)"),
  priority: z.number().int().default(0),
});

export const updateAnnouncementSchema = createAnnouncementSchema
  .partial()
  .extend({
    id: z.string().min(1, "ID is required to update"),
  });

export const deleteAnnouncementSchema = z.object({
  id: z.string().min(1, "ID is required to delete"),
});
