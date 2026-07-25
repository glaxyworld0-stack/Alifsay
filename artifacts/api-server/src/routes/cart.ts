import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartsTable, cartItemsTable, productsTable } from "@workspace/db";
import {
  AddToCartBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveCartItemParams,
  ApplyCouponBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const COUPONS: Record<string, number> = {
  WELCOME10: 0.10,
  ALIFSAY15: 0.15,
  EID20: 0.20,
  DIASPORA25: 0.25,
};

const SHIPPING_RATE = 15;
const FREE_SHIPPING_THRESHOLD = 150;

async function getOrCreateCart(sessionId: string) {
  let [cart] = await db
    .select()
    .from(cartsTable)
    .where(eq(cartsTable.sessionId, sessionId));

  if (!cart) {
    [cart] = await db
      .insert(cartsTable)
      .values({ sessionId })
      .returning();
  }

  return cart;
}

async function buildCartResponse(sessionId: string) {
  const cart = await getOrCreateCart(sessionId);

  const items = await db
    .select({ item: cartItemsTable, product: productsTable })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.cartId, cart.id));

  const cartItems = items
    .filter((r) => r.product !== null)
    .map((r) => {
      const p = r.product!;
      const price = p.isOnSale && p.salePrice != null ? Number(p.salePrice) : Number(p.price);
      return {
        id: r.item.id,
        productId: p.id,
        productName: p.name,
        productImage: ((p.images as string[]) ?? [])[0] ?? "",
        price: Number(p.price),
        salePrice: p.salePrice != null ? Number(p.salePrice) : null,
        quantity: r.item.quantity,
        size: r.item.size ?? null,
        color: r.item.color ?? null,
        total: +(price * r.item.quantity).toFixed(2),
      };
    });

  const subtotal = +(cartItems.reduce((sum, i) => sum + i.total, 0)).toFixed(2);
  let discount: number | null = null;

  if (cart.couponCode && COUPONS[cart.couponCode]) {
    discount = +(subtotal * COUPONS[cart.couponCode]).toFixed(2);
  }

  const afterDiscount = discount != null ? subtotal - discount : subtotal;
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const total = +(afterDiscount + shipping).toFixed(2);

  return {
    items: cartItems,
    subtotal,
    discount: discount ?? null,
    couponCode: cart.couponCode ?? null,
    shipping,
    total,
    itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
  };
}

function getSessionId(req: import("express").Request): string {
  const id = req.cookies?.["alifsay-session"];
  if (id) return id;
  // Generate a new one — returned via Set-Cookie in the response
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function ensureSession(
  req: import("express").Request,
  res: import("express").Response,
): string {
  const existing = req.cookies?.["alifsay-session"];
  if (existing) return existing;
  const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  res.cookie("alifsay-session", newId, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });
  return newId;
}

router.get("/cart", async (req, res): Promise<void> => {
  const sessionId = ensureSession(req, res);
  const cart = await buildCartResponse(sessionId);
  res.json(cart);
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const sessionId = ensureSession(req, res);
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cart = await getOrCreateCart(sessionId);

  // Check if same product+size+color already in cart
  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.cartId, cart.id),
        eq(cartItemsTable.productId, parsed.data.productId),
        ...(parsed.data.size ? [eq(cartItemsTable.size, parsed.data.size)] : []),
        ...(parsed.data.color ? [eq(cartItemsTable.color, parsed.data.color)] : []),
      ),
    );

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + parsed.data.quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      cartId: cart.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      size: parsed.data.size ?? null,
      color: parsed.data.color ?? null,
    });
  }

  const cartResponse = await buildCartResponse(sessionId);
  res.json(cartResponse);
});

router.patch("/cart/items/:itemId", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity: parsed.data.quantity })
      .where(eq(cartItemsTable.id, params.data.itemId));
  }

  const cartResponse = await buildCartResponse(sessionId);
  res.json(cartResponse);
});

router.delete("/cart/items/:itemId", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const params = RemoveCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));

  const cartResponse = await buildCartResponse(sessionId);
  res.json(cartResponse);
});

router.delete("/cart/clear", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const cart = await getOrCreateCart(sessionId);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
  await db.update(cartsTable).set({ couponCode: null, discount: null }).where(eq(cartsTable.id, cart.id));
  const cartResponse = await buildCartResponse(sessionId);
  res.json(cartResponse);
});

router.post("/cart/apply-coupon", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const parsed = ApplyCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const code = parsed.data.code.toUpperCase();
  if (!COUPONS[code]) {
    res.status(400).json({ error: "Invalid or expired coupon code" });
    return;
  }

  const cart = await getOrCreateCart(sessionId);
  await db
    .update(cartsTable)
    .set({ couponCode: code })
    .where(eq(cartsTable.id, cart.id));

  const cartResponse = await buildCartResponse(sessionId);
  res.json(cartResponse);
});

export { getSessionId, getOrCreateCart };
export default router;
