import prisma from "@/lib/db";

async function main() {
  const clothes = await prisma.category.create({
    data: {
      name: "Clothes",
      slug: "Clothes",
    },
  });

  const jackets = await prisma.category.create({
    data: {
      name: "jackets",
      slug: "jackets",
      parentId: clothes.id,
    },
  });

  const hody = await prisma.category.create({
    data: {
      name: "hody",
      slug: "hody",
      parentId: clothes.id,
    },
  });
}
