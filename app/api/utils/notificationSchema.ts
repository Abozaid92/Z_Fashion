import { z } from "zod";
import { Role, NotificationType as NotificationTypes } from "@prisma/client";

export const CreateGlobalNotificationSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title is too long (max 100 characters)"),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters long")
    .max(1500, "Description is too long (max 1500 characters)"),

  senderName: z
    .string()
    .min(2, "Sender name is required")
    .max(50, "Sender name is too long"),

  senderImage: z.string().url("Invalid image URL").optional().or(z.literal("")),

  sender: z.nativeEnum(Role).default(Role.ADMIN),

  notificationType: z
    .array(z.nativeEnum(NotificationTypes))
    .min(1, "Select at least one delivery channel"),
  pushUrl: z.string().url("Invalid link URL").optional().or(z.literal("")),
  pushImage: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export type CreateGlobalNotificationInput = z.infer<
  typeof CreateGlobalNotificationSchema
>;

export const deleteNotificationSchema = z.object({
  id: z.coerce
    .string({
      required_error: "ID is required",
    })
    .min(1, "ID cannot be empty"),
  // .cuid({ message: "Invalid CUID format" }),
});
//----------------------------------------------------------------------------------
// user part

export const getNotificationSchema = z.object({
  notificationsNumber: z.coerce.number().default(1),
});
export type GetNotificationInput = z.infer<typeof getNotificationSchema>;

export interface NotificationType {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sender: Role; // أو $Enums.Role إذا كنت تفضل تسمية بريزما
  title: string;
  description: string;
  senderImage: string | null;
  senderName: string;
  opens_count: number;
}

// patch => update isread
export const updateNotificationSchema = z.object({
  notificationId: z.string().optional(),
});

export type UpdateNotificationType = z.infer<typeof updateNotificationSchema>;

// export const GetNotificationsSchema = z.object({
//   limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
//   page: z.string().optional().transform((val) => (val ? parseInt(val) : 1) ),
// });
