/**
 * PRISMA ARGUMENT TYPES HELPER
 * Provides autocomplete for method arguments
 */

declare global {
  namespace PrismaArgs {
    type FindUniqueInput = {
      where: { id?: string; email?: string };
      include?: { accounts?: boolean };
      select?: any;
    };

    type FindFirstInput = {
      where?: { id?: string; email?: string; name?: string };
      include?: { accounts?: boolean };
      select?: any;
      orderBy?: any;
      skip?: number;
      take?: number;
    };

    type FindManyInput = {
      where?: { id?: string; email?: string; name?: string };
      include?: { accounts?: boolean };
      select?: any;
      orderBy?: any;
      skip?: number;
      take?: number;
    };

    type CreateInput = {
      data: {
        id?: string;
        name?: string;
        email?: string;
        emailVerified?: Date;
        password?: string;
        image?: string;
      };
      include?: { accounts?: boolean };
    };

    type UpdateInput = {
      where: { id: string };
      data: {
        name?: string;
        email?: string;
        emailVerified?: Date;
        password?: string;
        image?: string;
      };
      include?: { accounts?: boolean };
    };

    type DeleteInput = {
      where: { id: string };
    };

    type UpsertInput = {
      where: { id: string };
      create: any;
      update: any;
    };
  }
}

export {};
