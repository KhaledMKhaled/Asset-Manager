import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { kpiDefinitionsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/kpi-definitions", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(kpiDefinitionsTable).where(eq(kpiDefinitionsTable.isActive, true)).orderBy(asc(kpiDefinitionsTable.position));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/kpi-definitions", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.name || !req.body.kpiType) { res.status(400).json({ error: "name, kpiType required" }); return; }
    const [item] = await db.insert(kpiDefinitionsTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/kpi-definitions/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(kpiDefinitionsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(kpiDefinitionsTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/kpi-definitions/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(kpiDefinitionsTable).where(eq(kpiDefinitionsTable.id, (req.params.id as string)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
