import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { contactsTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";

const router = Router();

router.get("/contacts", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.search) conditions.push(ilike(contactsTable.fullName, `%${req.query.search}%`));
    if (req.query.companyId) conditions.push(eq(contactsTable.companyId, req.query.companyId as string));
    const items = await db.select().from(contactsTable).where(conditions.length ? and(...conditions) : undefined).orderBy(contactsTable.createdAt);
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/contacts", requireAuth, async (req, res): Promise<void> => {
  try {
    const { fullName } = req.body;
    if (!fullName) { res.status(400).json({ error: "fullName required" }); return; }
    const [item] = await db.insert(contactsTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contacts/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.select().from(contactsTable).where(eq(contactsTable.id, req.params.id)).limit(1);
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/contacts/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(contactsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(contactsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/contacts/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(contactsTable).where(eq(contactsTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
