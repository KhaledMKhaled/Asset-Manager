import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { customFieldDefinitionsTable } from "@workspace/db";
import { eq, and, desc, SQL } from "drizzle-orm";

const router = Router();

router.get("/custom-fields", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.entityType) conditions.push(eq(customFieldDefinitionsTable.entityType, req.query.entityType as string));
    const items = await db.select().from(customFieldDefinitionsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(customFieldDefinitionsTable.position);
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/custom-fields", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.entityType || !req.body.fieldName || !req.body.fieldType) {
      res.status(400).json({ error: "entityType, fieldName, and fieldType required" }); return;
    }
    const [item] = await db.insert(customFieldDefinitionsTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/custom-fields/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(customFieldDefinitionsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(customFieldDefinitionsTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/custom-fields/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.delete(customFieldDefinitionsTable).where(eq(customFieldDefinitionsTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
