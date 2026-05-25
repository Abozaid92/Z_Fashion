import { z } from "zod";
export const productFilterSchema = z.object({
  pageNumber: z.coerce.number().min(1).default(1),
  min: z.coerce.number().nonnegative().default(0),
  max: z.coerce.number().nonnegative().default(0),
  rating: z.coerce.number().min(0).max(5).default(0),
  search: z.string().optional().default(""),

  gender: z.preprocess((val) => {
    if (!val || val === "") return [];
    if (typeof val === "string") return val.split(",");
    return val;
  }, z.array(z.string()).default([])),

  size: z.preprocess((val) => {
    if (!val || val === "") return [];
    if (typeof val === "string") return val.split(",");
    return val;
  }, z.array(z.string()).default([])),
});
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
