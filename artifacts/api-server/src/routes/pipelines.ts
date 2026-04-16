import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { pipelinesTable, pipelineStagesTable } from "@workspace/db";
import { eq, desc, asc } from "drizzle-orm";

const router = Router();

router.get("/pipelines", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(pipelinesTable).orderBy(desc(pipelinesTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/pipelines", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.name) { res.status(400).json({ error: "name required" }); return; }
    const [item] = await db.insert(pipelinesTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pipelines/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [pipeline] = await db.select().from(pipelinesTable).where(eq(pipelinesTable.id, (req.params.id as string))).limit(1);
    if (!pipeline) { res.status(404).json({ error: "Not found" }); return; }
    const stages = await db.select().from(pipelineStagesTable).where(eq(pipelineStagesTable.pipelineId, (req.params.id as string))).orderBy(asc(pipelineStagesTable.position));
    res.json({ ...pipeline, stages });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/pipelines/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(pipelinesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(pipelinesTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/pipelines/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(pipelinesTable).where(eq(pipelinesTable.id, (req.params.id as string)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pipelines/:id/stages", requireAuth, async (req, res): Promise<void> => {
  try {
    const stages = await db.select().from(pipelineStagesTable).where(eq(pipelineStagesTable.pipelineId, (req.params.id as string))).orderBy(asc(pipelineStagesTable.position));
    res.json(stages);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/pipelines/:id/stages", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.name) { res.status(400).json({ error: "name required" }); return; }
    const [item] = await db.insert(pipelineStagesTable).values({ ...req.body, pipelineId: (req.params.id as string) }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/pipeline-stages/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(pipelineStagesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(pipelineStagesTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/pipeline-stages/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(pipelineStagesTable).where(eq(pipelineStagesTable.id, (req.params.id as string)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
