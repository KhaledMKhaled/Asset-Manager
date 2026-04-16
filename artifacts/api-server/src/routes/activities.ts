import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { activitiesTable } from "@workspace/db";
import { eq, and, SQL, desc } from "drizzle-orm";

const router = Router();

router.get("/activities", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.entityType) conditions.push(eq(activitiesTable.entityType, req.query.entityType as string));
    if (req.query.entityId) conditions.push(eq(activitiesTable.entityId, req.query.entityId as string));
    if (req.query.activityType) conditions.push(eq(activitiesTable.activityType, req.query.activityType as string));
    const items = await db.select().from(activitiesTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(activitiesTable.activityDatetime));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/activities", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.entityType || !req.body.entityId || !req.body.activityType) {
      res.status(400).json({ error: "entityType, entityId, activityType required" }); return;
    }
    const [item] = await db.insert(activitiesTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/activities/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, req.params.id)).limit(1);
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/activities/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(activitiesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(activitiesTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/activities/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(activitiesTable).where(eq(activitiesTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
