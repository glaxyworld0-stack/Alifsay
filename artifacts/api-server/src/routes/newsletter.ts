import { Router, type IRouter } from "express";
import { db, newsletterTable } from "@workspace/db";
import { SubscribeNewsletterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/newsletter/subscribe", async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    await db.insert(newsletterTable).values({ email: parsed.data.email });
    res.json({ success: true, message: "Successfully subscribed to our newsletter!" });
  } catch {
    // Unique constraint — already subscribed
    res.json({ success: true, message: "You are already subscribed to our newsletter." });
  }
});

export default router;
