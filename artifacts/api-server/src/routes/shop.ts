import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, categoriesTable, productsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/shop/summary", async (_req, res): Promise<void> => {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(productsTable);

  const categories = await db
    .select({
      category: categoriesTable,
      count: sql<number>`count(${productsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.sortOrder);

  const featuredCollections = [
    { name: "Wedding Collection", slug: "wedding-dresses", imageUrl: "", productCount: 0 },
    { name: "Luxury Pret", slug: "luxury-pret", imageUrl: "", productCount: 0 },
    { name: "Eid Specials", slug: "eid-specials", imageUrl: "", productCount: 0 },
    { name: "Designer Brands", slug: "designer-brands", imageUrl: "", productCount: 0 },
  ];

  // Try to fill in productCounts from categories
  for (const fc of featuredCollections) {
    const match = categories.find((c) => c.category.slug === fc.slug);
    if (match) {
      fc.productCount = match.count;
      fc.imageUrl = match.category.imageUrl ?? "";
    }
  }

  res.json({
    totalProducts: total,
    categories: categories.map((r) => ({
      categoryId: r.category.id,
      categoryName: r.category.name,
      slug: r.category.slug,
      count: r.count,
      imageUrl: r.category.imageUrl ?? null,
    })),
    featuredCollections,
  });
});

export default router;
