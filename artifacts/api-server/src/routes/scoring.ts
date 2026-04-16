import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { scoringModelsTable, scoringRulesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/scoring-models", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(scoringModelsTable).orderBy(desc(scoringModelsTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/scoring-models", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.name) { res.status(400).json({ error: "name required" }); return; }
    const [item] = await db.insert(scoringModelsTable).values({ ...req.body, totalWeight: req.body.totalWeight ?? "100" }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/scoring-models/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [model] = await db.select().from(scoringModelsTable).where(eq(scoringModelsTable.id, (req.params.id as string))).limit(1);
    if (!model) { res.status(404).json({ error: "Not found" }); return; }
    const rules = await db.select().from(scoringRulesTable).where(eq(scoringRulesTable.modelId, (req.params.id as string))).orderBy(scoringRulesTable.position);
    res.json({ ...model, rules });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/scoring-models/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(scoringModelsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(scoringModelsTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/scoring-models/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(scoringModelsTable).where(eq(scoringModelsTable.id, (req.params.id as string)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/scoring-models/:id/rules", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.category || !req.body.ruleName) { res.status(400).json({ error: "category, ruleName required" }); return; }
    const [item] = await db.insert(scoringRulesTable).values({ ...req.body, modelId: (req.params.id as string), scoreValue: req.body.scoreValue ?? "0" }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/scoring-rules/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(scoringRulesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(scoringRulesTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/scoring-rules/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(scoringRulesTable).where(eq(scoringRulesTable.id, (req.params.id as string)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
