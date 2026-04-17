import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { auditLogsTable } from "@workspace/db";
import { eq, and, desc, SQL } from "drizzle-orm";

const router = Router();

router.get("/audit-logs", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.entityType) conditions.push(eq(auditLogsTable.entityType, req.query.entityType as string));
    if (req.query.userId) conditions.push(eq(auditLogsTable.userId, req.query.userId as string));
    if (req.query.action) conditions.push(eq(auditLogsTable.action, req.query.action as string));
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const items = await db.select().from(auditLogsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/audit-logs", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.insert(auditLogsTable).values({
      ...req.body,
      ipAddress: req.ip,
    }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
