import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { botFlowsTable, botFlowStepsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/bot-flows", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(botFlowsTable).orderBy(desc(botFlowsTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bot-flows/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [flow] = await db.select().from(botFlowsTable).where(eq(botFlowsTable.id, req.params.id as string)).limit(1);
    if (!flow) { res.status(404).json({ error: "Not found" }); return; }
    const steps = await db.select().from(botFlowStepsTable).where(eq(botFlowStepsTable.flowId, req.params.id as string)).orderBy(botFlowStepsTable.position);
    res.json({ ...flow, steps });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bot-flows", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.name || !req.body.flowType || !req.body.triggerType) {
      res.status(400).json({ error: "name, flowType, and triggerType required" }); return;
    }
    const [item] = await db.insert(botFlowsTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bot-flows/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(botFlowsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(botFlowsTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bot-flows/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.delete(botFlowsTable).where(eq(botFlowsTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Flow Steps
router.post("/bot-flows/:id/steps", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.stepType) { res.status(400).json({ error: "stepType required" }); return; }
    const [item] = await db.insert(botFlowStepsTable).values({
      ...req.body,
      flowId: req.params.id as string,
    }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bot-flow-steps/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(botFlowStepsTable).set(req.body).where(eq(botFlowStepsTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bot-flow-steps/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.delete(botFlowStepsTable).where(eq(botFlowStepsTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
