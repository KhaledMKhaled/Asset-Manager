import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/settings", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(settingsTable).orderBy(settingsTable.key);
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings/:key", requireAuth, async (req, res): Promise<void> => {
  try {
    const { value } = req.body;
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, req.params.key)).limit(1);
    if (existing.length) {
      const [item] = await db.update(settingsTable).set({ value, updatedAt: new Date() }).where(eq(settingsTable.key, req.params.key)).returning();
      res.json(item);
    } else {
      const [item] = await db.insert(settingsTable).values({ key: req.params.key, value }).returning();
      res.json(item);
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
