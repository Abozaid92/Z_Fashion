import { DOMAIN, revalidate } from "@/lib/constants";
import axios from "axios";
import { AddToCartAction } from "@/actions/(Products)/CRUDToCart.action";
import { Size } from "@prisma/client";
import {
  CreateNotifPayload,
  typeResponse,
} from "@/app/[locale]/utils/admin/notifications/notitficationsTypes";
import { NotificationStats } from "@/app/api/utils/typesNotification";
/*
بص يا صديقي الفيلر دي هترجع ااةجكت 
احنا بقي هناخد الاةبجت ده ةنحولة للصييغه الي بيفهما المتسفصح باستخدام 
new UrlSearchPArams 
*/
// home page part
export const getHomepageShowcaseProducts = async () => {
  const res = await fetch(`${DOMAIN}/api/summary`, {
    next: { revalidate: revalidate, tags: ["summary"] },
  });
  // console.log(res);
  if (!res.ok) {
    return;
  }
  const body = await res.json();
  return body.products;
};
export const getCtgImage = async () => {
  const res = await fetch(`${DOMAIN}/api/summary`, {
    next: { revalidate: revalidate },
  });
  if (!res.ok) {
    // console.log(res);
    return;
  }
  const body = await res.json();
  return body.catsImage;
};
export const getHomepageShowcaseComments = async () => {
  const res = await fetch(`${DOMAIN}/api/summary`, {
    next: { revalidate: revalidate },
  });
  if (!res.ok) {
    // console.log(res);
    return;
  }
  // console.log(res);
  const body = await res.json();
  return body.comments;
};

//end home page part
export const fetchClothes = async (filter: any) => {
  const query = new URLSearchParams(filter).toString();
  const res = await fetch(`${DOMAIN}/api/products?${query}`);
  if (!res.ok) {
    throw new Error("something went wrong");
  }

  const body = await res.json();

  return body;
};

export const fetchClothesBySlug = async (productSlug: string) => {
  try {
    const res = await axios.get(`${DOMAIN}/api/products/${productSlug}`);
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};
export const fetchProductCount = async () => {
  try {
    const res = await axios.get(`${DOMAIN}/api/products/count`);
    // console.log(res);
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};

export const fetchToggleFavorite = async (productId: string) => {
  try {
    const res = await axios.post(`${DOMAIN}/api/products/favorite`, {
      productId: productId,
    });

    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};

export const fetchAddProductToCart = async (
  productId: string,
  quantity: number,
  size: Size,
) => {
  try {
    const data = { productId, quantity, size };
    const res = await AddToCartAction(data);
    if (!res.success) {
      return { meesage: res.message };
    }
    return res.message;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};

export const fetchMessages = async (userId: String, messageCount: number) => {
  try {
    if (userId === "GuestUser") return [];
    // // console.log("him in fetch messages");
    const res = await axios.get(
      `${DOMAIN}/api/chat?userId=${userId}&messageCount=${messageCount}`,
    );
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};
export const fetchNotification = async () => {
  try {
    const res = await axios.get(`${DOMAIN}/api/notification/userNotification`);
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};

export const readOneNotification = async (notificationId: string) => {
  try {
    // // console.log("him in fetch messages");
    const res = await axios.patch(
      `${DOMAIN}/api/notification/userNotification?notificationId=${notificationId}`,
    );
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};
export const readAllNotification = async () => {
  try {
    // // console.log("him in fetch messages");
    const res = await axios.patch(
      `${DOMAIN}/api/notification/userNotification`,
    );
    // // console.log(res);
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};

export const deleteOneNotification = async (notificationId: string) => {
  try {
    const res = await axios.delete(
      `${DOMAIN}/api/notification/userNotification?notificationId=${notificationId}`,
    );
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};
export const deleteAllNotification = async () => {
  try {
    const res = await axios.delete(
      `${DOMAIN}/api/notification/userNotification`,
    );
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};

export const readMessages = async (userId: String) => {
  try {
    // console.log("him in read messages");
    const res = await axios.patch(`${DOMAIN}/api/chat?userId=${userId}`);
    // console.log(res);
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};

// admin part
export const fetchChatRooms = async (chatRoomNumber: number) => {
  try {
    const res = await axios.get(
      `${DOMAIN}/api/chat/chatRoom?chatRoomNumber=${chatRoomNumber}`,
    );
    // console.log(res);
    return res.data;
  } catch (error) {
    throw new Error("someThing went wrong");
  }
};

export async function fetchNotifications(
  currentPage: number,
): Promise<typeResponse> {
  const res = await fetch(
    `${DOMAIN}/api/notification?notificationsNumber=${currentPage}`,
  );
  if (!res.ok) throw new Error(`GET /api/notification failed: ${res.status}`);
  return res.json();
}
export async function postNotification(
  payload: CreateNotifPayload,
): Promise<{ message: string; id: string }> {
  const res = await fetch(`${DOMAIN}/api/notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /api/notification failed: ${res.status}`);
  return res.json();
}
export async function deleteNotification(id: string) {
  const res = await fetch(`${DOMAIN}/api/notification?id=${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete notification");
  return res.json();
}
export async function getNotificationStats(): Promise<NotificationStats> {
  const res = await fetch(`${DOMAIN}/api/notification/stats`);
  if (!res.ok) throw new Error("Failed to fetch notification stats");
  return res.json();
}

// announcementBar
import { CreateNotifPayloadExtended } from "@/hooks/useNotifications";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnnouncementBarItem {
  id: string;
  title: string;
  description: string;
  barColor: string;
  barLink?: string | null;
  senderName: string;
  senderImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementBarResponse {
  bars: AnnouncementBarItem[];
  total: number;
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function postAnnouncementBar(
  payload: CreateNotifPayloadExtended,
): Promise<{ id: string }> {
  const res = await fetch(`${DOMAIN}/api/notification/announcement-bar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      senderName: payload.senderName,
      senderImage: payload.senderImage,
      barColor: payload.barColor ?? "#e8f3ec",
      barLink: payload.barLink,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to create announcement bar");
  }

  return res.json();
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function fetchAnnouncementBars(
  page = 1,
): Promise<AnnouncementBarResponse> {
  const res = await fetch(
    `${DOMAIN}/api/notification/announcement-bar?page=${page}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to fetch announcement bars");
  }

  return res.json();
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deleteAnnouncementBar(id: string): Promise<void> {
  const res = await fetch(
    `${DOMAIN}/api/notification/announcement-bar?id=${id}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to delete announcement bar");
  }
}
