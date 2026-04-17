import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { channelAccountsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/channel-accounts", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(channelAccountsTable).orderBy(desc(channelAccountsTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/channel-accounts", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.channelType) { res.status(400).json({ error: "channelType required" }); return; }
    const [item] = await db.insert(channelAccountsTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/channel-accounts/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(channelAccountsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(channelAccountsTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/channel-accounts/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.delete(channelAccountsTable).where(eq(channelAccountsTable.id, req.params.id as string)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
