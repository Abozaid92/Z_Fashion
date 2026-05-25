import prisma from "@/lib/db";
import { userPerPage } from "@/lib/constants";
import { Role, UserStatus } from "@prisma/client";

export async function getRawUsersFromDb(filters: any) {
  const { userNumber, search, role, status } = filters;

  // الحسبة اللي بتحدد هنبدأ منين في الداتا بيز
  const skip = (userNumber - 1) * userPerPage;

  const whereCondition: any = {
    AND: [
      search ?
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
      role ? { role: role as Role } : {},
      status ? { status: status as UserStatus } : {},
    ],
  };

  const users = await prisma.user.findMany({
    where: whereCondition,
    skip,
    take: userPerPage,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      country: true,
      image: true,
      createdAt: true,
      order: { select: { totalAmount: true } },
    },
  });

  return {
    users: JSON.parse(JSON.stringify(users)),
  };
}
