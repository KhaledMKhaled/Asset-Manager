import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { companiesTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";

const router = Router();

router.get("/companies", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.search) conditions.push(ilike(companiesTable.companyName, `%${req.query.search}%`));
    if (req.query.city) conditions.push(eq(companiesTable.city, req.query.city as string));
    if (req.query.businessType) conditions.push(eq(companiesTable.businessType, req.query.businessType as string));
    const items = await db.select().from(companiesTable).where(conditions.length ? and(...conditions) : undefined).orderBy(companiesTable.createdAt);
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/companies", requireAuth, async (req, res): Promise<void> => {
  try {
    const { companyName, ...rest } = req.body;
    if (!companyName) { res.status(400).json({ error: "companyName required" }); return; }
    const [item] = await db.insert(companiesTable).values({ companyName, ...rest }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/companies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.select().from(companiesTable).where(eq(companiesTable.id, req.params.id)).limit(1);
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/companies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    const [item] = await db.update(companiesTable).set(updates).where(eq(companiesTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/companies/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(companiesTable).where(eq(companiesTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
