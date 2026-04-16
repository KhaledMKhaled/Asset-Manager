import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { funnelStagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/funnel-stages", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(funnelStagesTable).orderBy(asc(funnelStagesTable.position));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/funnel-stages", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.name) { res.status(400).json({ error: "name required" }); return; }
    const [item] = await db.insert(funnelStagesTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/funnel-stages/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(funnelStagesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(funnelStagesTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/funnel-stages/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(funnelStagesTable).where(eq(funnelStagesTable.id, (req.params.id as string)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
