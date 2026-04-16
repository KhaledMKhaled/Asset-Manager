import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { campaignsTable } from "@workspace/db";
import { eq, and, SQL, desc } from "drizzle-orm";

const router = Router();

router.get("/campaigns", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.platform) conditions.push(eq(campaignsTable.platform, req.query.platform as string));
    if (req.query.status) conditions.push(eq(campaignsTable.status, req.query.status as string));
    const items = await db.select().from(campaignsTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(campaignsTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/campaigns", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.campaignName) { res.status(400).json({ error: "campaignName required" }); return; }
    const [item] = await db.insert(campaignsTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/campaigns/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, req.params.id)).limit(1);
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/campaigns/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(campaignsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(campaignsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/campaigns/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(campaignsTable).where(eq(campaignsTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
