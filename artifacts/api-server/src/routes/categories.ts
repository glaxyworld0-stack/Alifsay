import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { GetCategoryParams, CreateCategoryBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function getProductCount(categoryId: number): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(eq(productsTable.categoryId, categoryId));
  return count;
}

function formatCategory(
  c: typeof categoriesTable.$inferSelect,
  productCount: number = 0,
) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    imageUrl: c.imageUrl ?? null,
    productCount,
    sortOrder: c.sortOrder,
  };
}

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select({
      category: categoriesTable,
      count: sql<number>`count(${productsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.sortOrder);

  res.json(
    categories.map((r) => formatCategory(r.category, r.count)),
  );
});

router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [category] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json(formatCategory(category, 0));
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const params = GetCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [category] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, params.data.id));

  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const count = await getProductCount(category.id);
  res.json(formatCategory(category, count));
});

export default router;
