import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { hashPassword } from "../lib/auth";
import { usersTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";

const router = Router();

router.get("/users", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.role) conditions.push(eq(usersTable.role, req.query.role as string));
    if (req.query.isActive !== undefined) conditions.push(eq(usersTable.isActive, req.query.isActive === "true"));

    const users = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      team: usersTable.team,
      avatarUrl: usersTable.avatarUrl,
      language: usersTable.language,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    }).from(usersTable).where(conditions.length ? and(...conditions) : undefined);

    res.json(users);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", requireAuth, async (req, res): Promise<void> => {
  try {
    const { name, email, password, role, team, language } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email, password required" });
      return;
    }
    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      name, email, passwordHash, role: role ?? "sales_agent", team, language: language ?? "en",
    }).returning();
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "Email already exists" });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [user] = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      team: usersTable.team,
      avatarUrl: usersTable.avatarUrl,
      language: usersTable.language,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    }).from(usersTable).where(eq(usersTable.id, req.params.id)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const updates: Record<string, unknown> = {};
    const allowed = ["name", "email", "role", "team", "language", "isActive"];
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    updates.updatedAt = new Date();
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.params.id)).returning();
    if (!user) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
