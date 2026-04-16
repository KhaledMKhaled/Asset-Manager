import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { workflowsTable, automationRulesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/workflows", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(workflowsTable).orderBy(desc(workflowsTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/workflows", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.name) { res.status(400).json({ error: "name required" }); return; }
    const [item] = await db.insert(workflowsTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/workflows/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [workflow] = await db.select().from(workflowsTable).where(eq(workflowsTable.id, req.params.id)).limit(1);
    if (!workflow) { res.status(404).json({ error: "Not found" }); return; }
    const rules = await db.select().from(automationRulesTable).where(eq(automationRulesTable.workflowId, req.params.id)).orderBy(automationRulesTable.executionOrder);
    res.json({ ...workflow, rules });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/workflows/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(workflowsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(workflowsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/workflows/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(workflowsTable).where(eq(workflowsTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/workflows/:id/toggle", requireAuth, async (req, res): Promise<void> => {
  try {
    const [current] = await db.select({ isActive: workflowsTable.isActive }).from(workflowsTable).where(eq(workflowsTable.id, req.params.id)).limit(1);
    if (!current) { res.status(404).json({ error: "Not found" }); return; }
    const [item] = await db.update(workflowsTable).set({ isActive: !current.isActive, updatedAt: new Date() }).where(eq(workflowsTable.id, req.params.id)).returning();
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
