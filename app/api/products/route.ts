import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { adminGuard } from "@/lib/userGuards";
import {
  CreateProductSchema,
  UpdateProductSchema,
  DeleteProductSchema,
} from "../utils/productSchema";
import redisClient from "@/lib/redisClient";
import { revalidatePath, revalidateTag } from "next/cache";
// ─────────────────────────────────────────────────────────────
// 2. GET: جلب المنتجات مع الفلترة (Public)
// ─────────────────────────────────────────────────────────────
// import {DOMAIN} from "@/lib/constants";
// api/products
const userId = "3bd8b71c-56a5-41f2-ae2b-b89a57049127";

const categoryIds = [
  "cmnl9p0iy0003uikw35anv8e9",
  "cmnl9p0j50004uikwr3z31fsf",
  "cmnl9p0j50005uikwunylotdw",
  "cmnl9styj000duikwn62qd56k",
  "cmnl9styj000euikw9dduwnnx",
  "cmnl9ufnf000guikwfvjby2o6",
  "cmnl9ufnf000iuikwg3uwmm9m",
  "cmnl9ufnf000huikw5u1f1zpv",
];

export async function GET(request: NextRequest) {
  try {
    // استخدمنا for...of loop بدل createMany عشان Prisma يقدر يعمل إنشاء للمنتجات والكومنتات في نفس الوقت
    // for (const product of products) {
    //   await prisma.product.create({
    //     data: {
    //       name: product.name,
    //       slug: product.slug,
    //       description: product.description,
    //       price: product.price,
    //       image: product.image,
    //       gallery: product.gallery,
    //       brand: product.brand,
    //       inStock: product.inStock,
    //       countStock: product.countStock,
    //       discount: product.discount,
    //       // حل مشكلة الـ TypeScript مع حقل الـ Gender
    //       gender: product.gender as Gender[],
    //       size: product.size,
    //       subCategoryId: product.subCategoryId,
    //       // إنشاء الكومنتات المرتبطة بكل منتج
    //       comments: {
    //         create: product.comments,
    //       },
    //     },
    //   });
    // }
  } catch (error) {
    console.error("Error seeding products:", error);
    // return NextResponse.json({ message: "Failed to seed products" }, { status: 500 });
  }
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("q") || "";
    const category = searchParams.get("cat") || "";
    const min = Number(searchParams.get("min")) || 0;
    const max = Number(searchParams.get("max")) || 0;
    const page = Number(searchParams.get("page")) || 1;
    const sort = searchParams.get("sort") || "newest";
    const limit = 12;

    const sizesRaw = searchParams.get("sizes");
    const sizes = sizesRaw ? sizesRaw.split(",") : [];

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category)
      where.category = { slug: { contains: category, mode: "insensitive" } };
    if (min > 0 || max > 0) {
      where.price = {
        ...(min > 0 && { gte: min }),
        ...(max > 0 && { lte: max }),
      };
    }
    if (sizes.length > 0) where.size = { hasSome: sizes };

    // ترتيب البيانات
    const orderBy: any = {};
    if (sort === "newest") orderBy.createdAt = "desc";
    else if (sort === "price-asc") orderBy.price = "asc";
    else if (sort === "price-desc") orderBy.price = "desc";

    // ─── Promise.all: هنجيب البيانات والعدد في خبطة واحدة ──────────────────────
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,

        take: limit,
        skip: (page - 1) * limit,
        orderBy,
        include: {
          category: { select: { name: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json(
      {
        products,
        meta: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
// ─────────────────────────────────────────────────────────────
// 3. POST: إنشاء منتج جديد (Admin Only)
// ─────────────────────────────────────────────────────────────
export const POST = adminGuard(
  CreateProductSchema,
  async (_req, _userId, data) => {
    try {
      const existing = await prisma.product.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          { message: "Slug already in use." },
          { status: 409 },
        );
      }

      const categoryExists = await prisma.category.findUnique({
        where: { id: data.subCategoryId },
      });

      if (!categoryExists) {
        return NextResponse.json(
          { message: "Category not found." },
          { status: 404 },
        );
      }

      const product = await prisma.product.create({ data });
      revalidatePath(`/`);
      revalidateTag("products");
      revalidateTag(`summary`);
      try {
        redisClient
          .hIncrBy("stats:total:allStats", "totalProducts", 1)
          .catch((err) => console.error("Redis Incr Error:", err));
      } catch (e) {
        console.error("Redis incre totalproducts err Error:", e);
      }
      return NextResponse.json(
        { message: "Product created", product },
        { status: 201 },
      );
    } catch (error) {
      return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// 4. PATCH: تعديل منتج موجود (Admin Only)
// ─────────────────────────────────────────────────────────────
export const PATCH = adminGuard(
  UpdateProductSchema,
  async (_req, _userId, data) => {
    try {
      const { id, ...updateData } = data;

      // التأكد أن المنتج موجود
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: {
          slug: true,
        },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 },
        );
      }

      // لو السلج اتغير، نتأكد إنه مش مستخدم
      if (updateData.slug && updateData.slug !== existingProduct.slug) {
        const slugExists = await prisma.product.findUnique({
          where: { slug: updateData.slug },
        });
        if (slugExists) {
          return NextResponse.json(
            { message: "New slug already in use" },
            { status: 409 },
          );
        }
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });
      revalidatePath(`/`);
      revalidateTag("products");
      revalidateTag(`product-${existingProduct.slug}`);
      revalidateTag(`summary`);

      return NextResponse.json(
        { message: "Product updated", product: updated },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// 5. DELETE: حذف منتج (Admin Only)
// ─────────────────────────────────────────────────────────────
export const DELETE = adminGuard(
  DeleteProductSchema,
  async (_req, _userId, data) => {
    try {
      const existingProduct = await prisma.product.findUnique({
        where: { id: data.id },
        select: {
          slug: true,
        },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 },
        );
      }

      await prisma.product.delete({
        where: { id: data.id },
      });

      revalidatePath(`/`);
      revalidateTag("products");
      revalidateTag(`summary`);

      try {
        redisClient
          .hIncrBy("stats:total:allStats", "totalProducts", -1)
          .catch((err) => console.error("Redis Incr Error:", err));
      } catch (e) {
        console.error("Redis incre totalproducts err Error:", e);
      }

      return NextResponse.json(
        { message: "Product deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json({ message: "Delete failed" }, { status: 500 });
    }
  },
);
