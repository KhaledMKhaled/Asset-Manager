import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { agentAvailabilityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/agent-availability", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select().from(agentAvailabilityTable).orderBy(desc(agentAvailabilityTable.lastActivityAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/agent-availability/:userId", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.select().from(agentAvailabilityTable).where(eq(agentAvailabilityTable.userId, req.params.userId as string)).limit(1);
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/agent-availability/:userId", requireAuth, async (req, res): Promise<void> => {
  try {
    // Upsert: update if exists, create if not
    const existing = await db.select().from(agentAvailabilityTable).where(eq(agentAvailabilityTable.userId, req.params.userId as string)).limit(1);
    if (existing.length > 0) {
      const [item] = await db.update(agentAvailabilityTable).set({
        ...req.body,
        statusChangedAt: req.body.status ? new Date() : existing[0].statusChangedAt,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(agentAvailabilityTable.userId, req.params.userId as string)).returning();
      res.json(item);
    } else {
      const [item] = await db.insert(agentAvailabilityTable).values({
        ...req.body,
        userId: req.params.userId as string,
      }).returning();
      res.status(201).json(item);
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
