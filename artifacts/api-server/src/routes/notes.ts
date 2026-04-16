import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { notesTable } from "@workspace/db";
import { eq, and, SQL, desc } from "drizzle-orm";

const router = Router();

router.get("/notes", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.entityType) conditions.push(eq(notesTable.entityType, req.query.entityType as string));
    if (req.query.entityId) conditions.push(eq(notesTable.entityId, req.query.entityId as string));
    const items = await db.select().from(notesTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(notesTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notes", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.entityType || !req.body.entityId || !req.body.noteBody) {
      res.status(400).json({ error: "entityType, entityId, noteBody required" }); return;
    }
    const [item] = await db.insert(notesTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notes/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(notesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(notesTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/notes/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(notesTable).where(eq(notesTable.id, (req.params.id as string)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
