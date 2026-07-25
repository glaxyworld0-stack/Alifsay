import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, wishlistTable, productsTable, categoriesTable } from "@workspace/db";
import { AddToWishlistParams, RemoveFromWishlistParams } from "@workspace/api-zod";

const router: IRouter = Router();

function getSessionId(req: import("express").Request): string {
  return req.cookies?.["alifsay-session"] ?? `sess_anon_${req.ip}`;
}

function formatProduct(p: typeof productsTable.$inferSelect, categoryName?: string | null) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? null,
    price: Number(p.price),
    salePrice: p.salePrice != null ? Number(p.salePrice) : null,
    categoryId: p.categoryId,
    categoryName: categoryName ?? null,
    brand: p.brand ?? null,
    fabric: p.fabric ?? null,
    images: (p.images as string[]) ?? [],
    sizes: (p.sizes as string[]) ?? [],
    colors: (p.colors as string[]) ?? [],
    sku: p.sku ?? null,
    inStock: p.inStock,
    stockQuantity: p.stockQuantity ?? null,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    isOnSale: p.isOnSale,
    rating: p.rating != null ? Number(p.rating) : null,
    reviewCount: p.reviewCount,
    createdAt: p.createdAt.toISOString(),
  };
}

async function getWishlistProducts(sessionId: string) {
  const items = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(wishlistTable)
    .leftJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(wishlistTable.sessionId, sessionId));

  return items
    .filter((r) => r.product !== null)
    .map((r) => formatProduct(r.product!, r.categoryName));
}

router.get("/wishlist", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const products = await getWishlistProducts(sessionId);
  res.json(products);
});

router.post("/wishlist/:productId", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const params = AddToWishlistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(wishlistTable)
    .where(
      and(
        eq(wishlistTable.sessionId, sessionId),
        eq(wishlistTable.productId, params.data.productId),
      ),
    );

  if (!existing) {
    await db.insert(wishlistTable).values({
      sessionId,
      productId: params.data.productId,
    });
  }

  const products = await getWishlistProducts(sessionId);
  res.json(products);
});

router.delete("/wishlist/:productId", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const params = RemoveFromWishlistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(wishlistTable).where(
    and(
      eq(wishlistTable.sessionId, sessionId),
      eq(wishlistTable.productId, params.data.productId),
    ),
  );

  const products = await getWishlistProducts(sessionId);
  res.json(products);
});

export default router;
