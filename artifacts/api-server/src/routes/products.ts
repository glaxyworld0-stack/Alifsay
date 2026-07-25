import { Router, type IRouter } from "express";
import { eq, and, gte, lte, inArray, ilike, desc, asc, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable, reviewsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListFeaturedProductsQueryParams,
  ListNewArrivalsQueryParams,
  ListBestSellersQueryParams,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
  CreateProductBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

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

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const {
    categoryId, search, minPrice, maxPrice,
    inStock, onSale, brand, fabric,
    sort, page = 1, limit = 24,
  } = query.data;

  const conditions: ReturnType<typeof eq>[] = [];

  if (categoryId != null) conditions.push(eq(productsTable.categoryId, categoryId));
  if (inStock != null) conditions.push(eq(productsTable.inStock, inStock));
  if (onSale === true) conditions.push(eq(productsTable.isOnSale, true));
  if (brand) conditions.push(ilike(productsTable.brand, `%${brand}%`));
  if (fabric) conditions.push(ilike(productsTable.fabric, `%${fabric}%`));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (minPrice != null) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice != null) conditions.push(lte(productsTable.price, String(maxPrice)));

  let orderBy;
  switch (sort) {
    case "price_asc": orderBy = asc(productsTable.price); break;
    case "price_desc": orderBy = desc(productsTable.price); break;
    case "best_sellers": orderBy = desc(productsTable.salesCount); break;
    case "featured": orderBy = desc(productsTable.isFeatured); break;
    default: orderBy = desc(productsTable.createdAt);
  }

  const pageNum = page ?? 1;
  const limitNum = limit ?? 24;
  const offset = (pageNum - 1) * limitNum;

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(where);

  const products = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(where)
    .orderBy(orderBy)
    .limit(limitNum)
    .offset(offset);

  res.json({
    products: products.map((r) => formatProduct(r.product, r.categoryName)),
    total: count,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(count / limitNum),
  });
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slug = parsed.data.slug ??
    parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const [product] = await db
    .insert(productsTable)
    .values({
      ...parsed.data,
      slug,
      price: String(parsed.data.price),
      salePrice: parsed.data.salePrice != null ? String(parsed.data.salePrice) : undefined,
    })
    .returning();

  res.status(201).json(formatProduct(product));
});

router.get("/products/featured", async (req, res): Promise<void> => {
  const query = ListFeaturedProductsQueryParams.safeParse(req.query);
  const limitNum = query.success && query.data.limit != null ? query.data.limit : 8;

  const products = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.isFeatured, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(limitNum);

  res.json(products.map((r) => formatProduct(r.product, r.categoryName)));
});

router.get("/products/new-arrivals", async (req, res): Promise<void> => {
  const query = ListNewArrivalsQueryParams.safeParse(req.query);
  const limitNum = query.success && query.data.limit != null ? query.data.limit : 8;

  const products = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.isNewArrival, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(limitNum);

  res.json(products.map((r) => formatProduct(r.product, r.categoryName)));
});

router.get("/products/best-sellers", async (req, res): Promise<void> => {
  const query = ListBestSellersQueryParams.safeParse(req.query);
  const limitNum = query.success && query.data.limit != null ? query.data.limit : 8;

  const products = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.isBestSeller, true))
    .orderBy(desc(productsTable.salesCount))
    .limit(limitNum);

  res.json(products.map((r) => formatProduct(r.product, r.categoryName)));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(row.product, row.categoryName));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price != null) updateData.price = String(parsed.data.price);
  if (parsed.data.salePrice != null) updateData.salePrice = String(parsed.data.salePrice);

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/products/:id/related", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [original] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!original) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const related = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(
      and(
        eq(productsTable.categoryId, original.categoryId),
        sql`${productsTable.id} != ${params.data.id}`,
      ),
    )
    .orderBy(desc(productsTable.isBestSeller))
    .limit(6);

  res.json(related.map((r) => formatProduct(r.product, r.categoryName)));
});

router.get("/products/:id/reviews", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, params.data.id))
    .orderBy(desc(reviewsTable.createdAt));

  res.json(
    reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      authorName: r.authorName,
      authorCountry: r.authorCountry ?? null,
      rating: r.rating,
      title: r.title ?? null,
      body: r.body ?? null,
      verified: r.verified,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.post("/products/:id/reviews", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { authorName, authorCountry, rating, title, body } = req.body;
  if (!authorName || !rating) {
    res.status(400).json({ error: "authorName and rating are required" });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({
      productId: params.data.id,
      authorName,
      authorCountry: authorCountry ?? null,
      rating: Number(rating),
      title: title ?? null,
      body: body ?? null,
      verified: false,
    })
    .returning();

  // Update product rating
  const allReviews = await db
    .select({ rating: reviewsTable.rating })
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, params.data.id));

  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await db
    .update(productsTable)
    .set({
      rating: String(avgRating.toFixed(2)),
      reviewCount: allReviews.length,
    })
    .where(eq(productsTable.id, params.data.id));

  res.status(201).json({
    id: review.id,
    productId: review.productId,
    authorName: review.authorName,
    authorCountry: review.authorCountry ?? null,
    rating: review.rating,
    title: review.title ?? null,
    body: review.body ?? null,
    verified: review.verified,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
