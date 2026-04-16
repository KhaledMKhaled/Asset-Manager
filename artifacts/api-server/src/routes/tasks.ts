import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { tasksTable } from "@workspace/db";
import { eq, and, SQL, desc, lte } from "drizzle-orm";

const router = Router();

router.get("/tasks", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.assignedTo) conditions.push(eq(tasksTable.assignedTo, req.query.assignedTo as string));
    if (req.query.status) conditions.push(eq(tasksTable.status, req.query.status as string));
    if (req.query.priority) conditions.push(eq(tasksTable.priority, req.query.priority as string));
    if (req.query.taskType) conditions.push(eq(tasksTable.taskType, req.query.taskType as string));
    if (req.query.entityId) conditions.push(eq(tasksTable.entityId, req.query.entityId as string));
    if (req.query.overdue === "true") conditions.push(lte(tasksTable.dueDate, new Date()));
    const items = await db.select().from(tasksTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(tasksTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tasks", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.title) { res.status(400).json({ error: "title required" }); return; }
    const [item] = await db.insert(tasksTable).values({
      ...req.body,
      taskType: req.body.taskType ?? "follow_up",
      priority: req.body.priority ?? "medium",
      source: req.body.source ?? "manual",
    }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.select().from(tasksTable).where(eq(tasksTable.id, (req.params.id as string))).limit(1);
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(tasksTable).set({ ...req.body, updatedAt: new Date() }).where(eq(tasksTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(tasksTable).where(eq(tasksTable.id, (req.params.id as string)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tasks/:id/complete", requireAuth, async (req, res): Promise<void> => {
  try {
    const { result, completionNotes } = req.body;
    const [item] = await db.update(tasksTable).set({
      status: "completed",
      result,
      completionNotes,
      completedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(tasksTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
