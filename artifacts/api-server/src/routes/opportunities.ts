import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { opportunitiesTable } from "@workspace/db";
import { eq, and, SQL, desc } from "drizzle-orm";

const router = Router();

router.get("/opportunities", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.status) conditions.push(eq(opportunitiesTable.status, req.query.status as string));
    if (req.query.pipelineId) conditions.push(eq(opportunitiesTable.pipelineId, req.query.pipelineId as string));
    if (req.query.assignedTo) conditions.push(eq(opportunitiesTable.assignedTo, req.query.assignedTo as string));
    if (req.query.stageId) conditions.push(eq(opportunitiesTable.currentStageId, req.query.stageId as string));
    const items = await db.select().from(opportunitiesTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(opportunitiesTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/opportunities", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.insert(opportunitiesTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/opportunities/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.select().from(opportunitiesTable).where(eq(opportunitiesTable.id, req.params.id)).limit(1);
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/opportunities/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(opportunitiesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(opportunitiesTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/opportunities/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
