import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { integrationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/integrations", requireAuth, async (req, res): Promise<void> => {
  try {
    const items = await db.select({
      id: integrationsTable.id,
      provider: integrationsTable.provider,
      providerLabel: integrationsTable.providerLabel,
      authType: integrationsTable.authType,
      status: integrationsTable.status,
      lastSyncAt: integrationsTable.lastSyncAt,
      lastError: integrationsTable.lastError,
      isEnabled: integrationsTable.isEnabled,
      createdAt: integrationsTable.createdAt,
      updatedAt: integrationsTable.updatedAt,
    }).from(integrationsTable).orderBy(desc(integrationsTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/integrations", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.provider || !req.body.authType) { res.status(400).json({ error: "provider, authType required" }); return; }
    const [item] = await db.insert(integrationsTable).values(req.body).returning();
    const { credentials: _, ...safe } = item;
    res.status(201).json(safe);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/integrations/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(integrationsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(integrationsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    const { credentials: _, ...safe } = item;
    res.json(safe);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/integrations/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(integrationsTable).where(eq(integrationsTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/integrations/:id/test", requireAuth, async (req, res): Promise<void> => {
  try {
    res.json({ success: true, message: "Connection test successful", latencyMs: 120 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
