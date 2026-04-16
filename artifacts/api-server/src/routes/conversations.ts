import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import { conversationsTable, messagesTable } from "@workspace/db";
import { eq, and, SQL, desc, ilike } from "drizzle-orm";

const router = Router();

router.get("/conversations", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.channel) conditions.push(eq(conversationsTable.channel, req.query.channel as string));
    if (req.query.status) conditions.push(eq(conversationsTable.status, req.query.status as string));
    if (req.query.assignedTo) conditions.push(eq(conversationsTable.assignedTo, req.query.assignedTo as string));
    if (req.query.priority) conditions.push(eq(conversationsTable.priority, req.query.priority as string));
    if (req.query.search) conditions.push(ilike(conversationsTable.participantName, `%${req.query.search}%`));
    const items = await db.select().from(conversationsTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(conversationsTable.lastMessageAt));
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations", requireAuth, async (req, res): Promise<void> => {
  try {
    if (!req.body.channel) { res.status(400).json({ error: "channel required" }); return; }
    const [item] = await db.insert(conversationsTable).values(req.body).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [conversation] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, req.params.id)).limit(1);
    if (!conversation) { res.status(404).json({ error: "Not found" }); return; }
    const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, req.params.id)).orderBy(desc(messagesTable.createdAt)).limit(100);
    res.json({ ...conversation, messages: messages.reverse() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(conversationsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(conversationsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  try {
    const { messageText, contentType, isInternalNote, templateId } = req.body;
    if (!messageText) { res.status(400).json({ error: "messageText required" }); return; }
    const [msg] = await db.insert(messagesTable).values({
      conversationId: req.params.id,
      direction: "outbound",
      senderType: "agent",
      contentType: contentType ?? "text",
      messageText,
      isInternalNote: isInternalNote ?? false,
      botGenerated: false,
      templateId,
    }).returning();
    await db.update(conversationsTable).set({
      lastMessageAt: new Date(),
      messageCount: db.$count(messagesTable, eq(messagesTable.conversationId, req.params.id)),
      updatedAt: new Date(),
    }).where(eq(conversationsTable.id, req.params.id));
    res.status(201).json(msg);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/conversations/:id/assign", requireAuth, async (req, res): Promise<void> => {
  try {
    const { assignedTo, team } = req.body;
    if (!assignedTo) { res.status(400).json({ error: "assignedTo required" }); return; }
    const [item] = await db.update(conversationsTable).set({ assignedTo, team, updatedAt: new Date() }).where(eq(conversationsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/close", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(conversationsTable).set({ status: "resolved", closedAt: new Date(), updatedAt: new Date() }).where(eq(conversationsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
