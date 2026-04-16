import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { messageTemplatesTable } from "@workspace/db";
import { eq, and, SQL, desc } from "drizzle-orm";

const router = Router();

router.get("/message-templates", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.channel) conditions.push(eq(messageTemplatesTable.channel, req.query.channel as string));
    if (req.query.category) conditions.push(eq(messageTemplatesTable.category, req.query.category as string));
    const items = await db.select().from(messageTemplatesTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(messageTemplatesTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/message-templates", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.name || !req.body.body) { res.status(400).json({ error: "name, body required" }); return; }
    const [item] = await db.insert(messageTemplatesTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/message-templates/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(messageTemplatesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(messageTemplatesTable.id, (req.params.id as string))).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/message-templates/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(messageTemplatesTable).where(eq(messageTemplatesTable.id, (req.params.id as string)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
