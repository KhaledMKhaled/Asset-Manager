import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { notificationsTable } from "@workspace/db";
import { eq, and, SQL, desc } from "drizzle-orm";

const router = Router();

router.get("/notifications", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const conditions: SQL[] = [eq(notificationsTable.userId, req.user!.userId)];
    if (req.query.isRead !== undefined) conditions.push(eq(notificationsTable.isRead, req.query.isRead === "true"));
    const items = await db.select().from(notificationsTable).where(and(...conditions)).orderBy(desc(notificationsTable.createdAt)).limit(50);
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(notificationsTable).set({ isRead: true, readAt: new Date() }).where(eq(notificationsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notifications/read-all", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    await db.update(notificationsTable).set({ isRead: true, readAt: new Date() }).where(eq(notificationsTable.userId, req.user!.userId));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
