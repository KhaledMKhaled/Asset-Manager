import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { botPersonasTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/bot-personas", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(botPersonasTable).orderBy(desc(botPersonasTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bot-personas/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.select().from(botPersonasTable).where(eq(botPersonasTable.id, req.params.id as string)).limit(1);
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bot-personas", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.name) { res.status(400).json({ error: "name required" }); return; }
    const [item] = await db.insert(botPersonasTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bot-personas/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(botPersonasTable).set({ ...req.body, updatedAt: new Date() }).where(eq(botPersonasTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bot-personas/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.delete(botPersonasTable).where(eq(botPersonasTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
