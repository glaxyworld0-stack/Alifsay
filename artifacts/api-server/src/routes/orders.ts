import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, cartsTable, cartItemsTable, productsTable } from "@workspace/db";
import { GetOrderParams, TrackOrderParams, CreateOrderBody } from "@workspace/api-zod";

const router: IRouter = Router();

function getSessionId(req: import("express").Request): string {
  return req.cookies?.["alifsay-session"] ?? `sess_anon_${req.ip}`;
}

function generateOrderNumber(): string {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `ALF${yy}${mm}${rand}`;
}

function getEstimatedDelivery(): string {
  const d = new Date();
  d.setDate(d.getDate() + 10 + Math.floor(Math.random() * 5));
  return d.toISOString().split("T")[0];
}

function formatOrder(
  order: typeof ordersTable.$inferSelect,
  items: typeof orderItemsTable.$inferSelect[],
) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productImage: i.productImage,
      price: Number(i.price),
      quantity: i.quantity,
      size: i.size ?? null,
      color: i.color ?? null,
      total: Number(i.total),
    })),
    subtotal: Number(order.subtotal),
    discount: order.discount != null ? Number(order.discount) : null,
    shipping: Number(order.shipping),
    total: Number(order.total),
    couponCode: order.couponCode ?? null,
    shippingAddress: order.shippingAddress as object,
    paymentMethod: order.paymentMethod ?? null,
    estimatedDelivery: order.estimatedDelivery ?? null,
    trackingNumber: order.trackingNumber ?? null,
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.sessionId, sessionId))
    .orderBy(ordersTable.createdAt);

  const result = await Promise.all(
    orders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));
      return formatOrder(order, items);
    }),
  );

  res.json(result);
});

router.post("/orders", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Get the cart
  const [cart] = await db
    .select()
    .from(cartsTable)
    .where(eq(cartsTable.sessionId, sessionId));

  if (!cart) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const cartItems = await db
    .select({ item: cartItemsTable, product: productsTable })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.cartId, cart.id));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const COUPONS: Record<string, number> = {
    WELCOME10: 0.10,
    ALIFSAY15: 0.15,
    EID20: 0.20,
    DIASPORA25: 0.25,
  };

  const orderItemValues = cartItems
    .filter((r) => r.product !== null)
    .map((r) => {
      const p = r.product!;
      const price = p.isOnSale && p.salePrice != null ? Number(p.salePrice) : Number(p.price);
      return {
        productId: p.id,
        productName: p.name,
        productImage: ((p.images as string[]) ?? [])[0] ?? "",
        price: String(price),
        quantity: r.item.quantity,
        size: r.item.size ?? null,
        color: r.item.color ?? null,
        total: String((price * r.item.quantity).toFixed(2)),
      };
    });

  const subtotal = orderItemValues.reduce((sum, i) => sum + Number(i.total), 0);
  let discount: number | null = null;
  const couponCode = parsed.data.couponCode ?? cart.couponCode ?? null;
  if (couponCode && COUPONS[couponCode.toUpperCase()]) {
    discount = +(subtotal * COUPONS[couponCode.toUpperCase()]).toFixed(2);
  }

  const FREE_SHIPPING_THRESHOLD = 150;
  const SHIPPING_RATE = 15;
  const afterDiscount = discount != null ? subtotal - discount : subtotal;
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const total = +(afterDiscount + shipping).toFixed(2);

  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber: generateOrderNumber(),
      sessionId,
      status: "confirmed",
      subtotal: String(subtotal.toFixed(2)),
      discount: discount != null ? String(discount.toFixed(2)) : null,
      shipping: String(shipping),
      total: String(total),
      couponCode,
      paymentMethod: parsed.data.paymentMethod,
      customerEmail: parsed.data.customerEmail ?? null,
      customerPhone: parsed.data.customerPhone ?? null,
      shippingAddress: parsed.data.shippingAddress,
      estimatedDelivery: getEstimatedDelivery(),
      trackingNumber: null,
    })
    .returning();

  const insertedItems = await db
    .insert(orderItemsTable)
    .values(orderItemValues.map((i) => ({ ...i, orderId: order.id })))
    .returning();

  // Clear cart after order
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
  await db.update(cartsTable).set({ couponCode: null, discount: null }).where(eq(cartsTable.id, cart.id));

  res.status(201).json(formatOrder(order, insertedItems));
});

router.get("/orders/track/:orderNumber", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderNumber)
    ? req.params.orderNumber[0]
    : req.params.orderNumber;

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, raw));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const statusHistory = [
    { status: "Order Placed", description: "Your order has been received and confirmed.", timestamp: order.createdAt.toISOString() },
  ];

  const now = new Date();
  const created = new Date(order.createdAt);
  const hoursSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  if (hoursSince > 2 || ["processing", "shipped", "delivered"].includes(order.status)) {
    statusHistory.push({
      status: "Processing",
      description: "Your order is being prepared and packed.",
      timestamp: new Date(created.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    });
  }

  if (["shipped", "delivered"].includes(order.status)) {
    statusHistory.push({
      status: "Shipped",
      description: `Your order has been dispatched. Tracking: ${order.trackingNumber ?? "Pending"}.`,
      timestamp: new Date(created.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  if (order.status === "delivered") {
    statusHistory.push({
      status: "Delivered",
      description: "Your order has been delivered successfully.",
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    orderNumber: order.orderNumber,
    status: order.status,
    estimatedDelivery: order.estimatedDelivery ?? null,
    trackingNumber: order.trackingNumber ?? null,
    statusHistory,
  });
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  res.json(formatOrder(order, items));
});

export default router;
