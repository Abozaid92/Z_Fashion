// getAnnouncment-barFromDB
import prisma from "@/lib/db";
export const getAnnouncmentNotif = async () => {
  try {
    const notif = await prisma.announcement.findMany({ take: 3 });
    return notif;
  } catch (error) {
    console.error("failde to get announcment notif", error);
  }
};
