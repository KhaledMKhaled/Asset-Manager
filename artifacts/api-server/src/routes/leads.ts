import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import {
  leadsTable, companiesTable, contactsTable, usersTable,
  activitiesTable, notesTable, opportunitiesTable, timelineEventsTable,
} from "@workspace/db";
import { eq, ilike, and, SQL, desc, count } from "drizzle-orm";

const router = Router();

function genLeadCode(): string {
  return `L-${Date.now().toString(36).toUpperCase()}`;
}

router.get("/leads", requireAuth, async (req, res): Promise<void> => {
  try {
    const conditions: SQL[] = [];
    if (req.query.search) conditions.push(ilike(companiesTable.companyName, `%${req.query.search}%`));
    if (req.query.status) conditions.push(eq(leadsTable.leadStatus, req.query.status as string));
    if (req.query.assignedTo) conditions.push(eq(leadsTable.assignedTo, req.query.assignedTo as string));
    if (req.query.campaignId) conditions.push(eq(leadsTable.campaignId, req.query.campaignId as string));
    if (req.query.scoreGrade) conditions.push(eq(leadsTable.scoreGrade, req.query.scoreGrade as string));
    if (req.query.funnelStageId) conditions.push(eq(leadsTable.currentFunnelStageId, req.query.funnelStageId as string));
    if (req.query.source) conditions.push(eq(leadsTable.leadSource, req.query.source as string));

    const page = parseInt(req.query.page as string ?? "1") || 1;
    const limit = parseInt(req.query.limit as string ?? "25") || 25;
    const offset = (page - 1) * limit;

    const where = conditions.length ? and(...conditions) : undefined;

    const [leads, [{ total }]] = await Promise.all([
      db.select({
        id: leadsTable.id,
        leadCode: leadsTable.leadCode,
        companyId: leadsTable.companyId,
        primaryContactId: leadsTable.primaryContactId,
        campaignId: leadsTable.campaignId,
        assignedTo: leadsTable.assignedTo,
        leadSource: leadsTable.leadSource,
        leadStatus: leadsTable.leadStatus,
        contactStatus: leadsTable.contactStatus,
        qualificationStatus: leadsTable.qualificationStatus,
        isMql: leadsTable.isMql,
        isSql: leadsTable.isSql,
        leadScore: leadsTable.leadScore,
        aiLeadScore: leadsTable.aiLeadScore,
        scoreGrade: leadsTable.scoreGrade,
        aiSummary: leadsTable.aiSummary,
        currentFunnelStageId: leadsTable.currentFunnelStageId,
        pipelineId: leadsTable.pipelineId,
        currentStageId: leadsTable.currentStageId,
        tags: leadsTable.tags,
        duplicateFlag: leadsTable.duplicateFlag,
        createdAt: leadsTable.createdAt,
        updatedAt: leadsTable.updatedAt,
        company: {
          id: companiesTable.id,
          companyName: companiesTable.companyName,
          businessType: companiesTable.businessType,
          companySize: companiesTable.companySize,
          branchCount: companiesTable.branchCount,
          taxProfileStatus: companiesTable.taxProfileStatus,
          city: companiesTable.city,
          country: companiesTable.country,
          website: companiesTable.website,
          currentSystem: companiesTable.currentSystem,
          createdAt: companiesTable.createdAt,
          updatedAt: companiesTable.updatedAt,
        },
        primaryContact: {
          id: contactsTable.id,
          companyId: contactsTable.companyId,
          fullName: contactsTable.fullName,
          phone: contactsTable.phone,
          email: contactsTable.email,
          jobTitle: contactsTable.jobTitle,
          preferredContactMethod: contactsTable.preferredContactMethod,
          language: contactsTable.language,
          isPrimary: contactsTable.isPrimary,
          createdAt: contactsTable.createdAt,
        },
        assignedUser: {
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
        },
      })
        .from(leadsTable)
        .leftJoin(companiesTable, eq(leadsTable.companyId, companiesTable.id))
        .leftJoin(contactsTable, eq(leadsTable.primaryContactId, contactsTable.id))
        .leftJoin(usersTable, eq(leadsTable.assignedTo, usersTable.id))
        .where(where)
        .orderBy(desc(leadsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(leadsTable).where(where),
    ]);

    res.json({ leads, total: Number(total), page, limit });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/leads", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const [lead] = await db.insert(leadsTable).values({
      ...req.body,
      leadCode: genLeadCode(),
      assignedTo: req.body.assignedTo ?? req.user!.userId,
    }).returning();
    await db.insert(timelineEventsTable).values({
      entityType: "lead",
      entityId: lead.id,
      eventType: "lead_created",
      renderedTitle: "Lead created",
    });
    res.status(201).json(lead);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leads/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [lead] = await db.select({
      id: leadsTable.id,
      leadCode: leadsTable.leadCode,
      companyId: leadsTable.companyId,
      primaryContactId: leadsTable.primaryContactId,
      campaignId: leadsTable.campaignId,
      assignedTo: leadsTable.assignedTo,
      leadSource: leadsTable.leadSource,
      leadStatus: leadsTable.leadStatus,
      contactStatus: leadsTable.contactStatus,
      qualificationStatus: leadsTable.qualificationStatus,
      isMql: leadsTable.isMql,
      isSql: leadsTable.isSql,
      leadScore: leadsTable.leadScore,
      aiLeadScore: leadsTable.aiLeadScore,
      scoreGrade: leadsTable.scoreGrade,
      aiSummary: leadsTable.aiSummary,
      currentFunnelStageId: leadsTable.currentFunnelStageId,
      pipelineId: leadsTable.pipelineId,
      currentStageId: leadsTable.currentStageId,
      tags: leadsTable.tags,
      duplicateFlag: leadsTable.duplicateFlag,
      createdAt: leadsTable.createdAt,
      updatedAt: leadsTable.updatedAt,
      company: {
        id: companiesTable.id,
        companyName: companiesTable.companyName,
        businessType: companiesTable.businessType,
        companySize: companiesTable.companySize,
        branchCount: companiesTable.branchCount,
        taxProfileStatus: companiesTable.taxProfileStatus,
        city: companiesTable.city,
        country: companiesTable.country,
        website: companiesTable.website,
        currentSystem: companiesTable.currentSystem,
        createdAt: companiesTable.createdAt,
        updatedAt: companiesTable.updatedAt,
      },
      primaryContact: {
        id: contactsTable.id,
        companyId: contactsTable.companyId,
        fullName: contactsTable.fullName,
        phone: contactsTable.phone,
        email: contactsTable.email,
        jobTitle: contactsTable.jobTitle,
        preferredContactMethod: contactsTable.preferredContactMethod,
        language: contactsTable.language,
        isPrimary: contactsTable.isPrimary,
        createdAt: contactsTable.createdAt,
      },
      assignedUser: {
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
      },
    })
      .from(leadsTable)
      .leftJoin(companiesTable, eq(leadsTable.companyId, companiesTable.id))
      .leftJoin(contactsTable, eq(leadsTable.primaryContactId, contactsTable.id))
      .leftJoin(usersTable, eq(leadsTable.assignedTo, usersTable.id))
      .where(eq(leadsTable.id, req.params.id))
      .limit(1);

    if (!lead) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const [activities, notes, opportunities] = await Promise.all([
      db.select().from(activitiesTable).where(and(eq(activitiesTable.entityType, "lead"), eq(activitiesTable.entityId, req.params.id))).orderBy(desc(activitiesTable.activityDatetime)).limit(20),
      db.select().from(notesTable).where(and(eq(notesTable.entityType, "lead"), eq(notesTable.entityId, req.params.id))).orderBy(desc(notesTable.createdAt)).limit(20),
      db.select().from(opportunitiesTable).where(eq(opportunitiesTable.leadId, req.params.id)).orderBy(desc(opportunitiesTable.createdAt)).limit(10),
    ]);

    res.json({ ...lead, activities, notes, opportunities });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/leads/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const [item] = await db.update(leadsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(leadsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/leads/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    await db.delete(leadsTable).where(eq(leadsTable.id, req.params.id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/leads/:id/stage", requireAuth, async (req, res): Promise<void> => {
  try {
    const { stageId, stageContext, notes } = req.body;
    const [item] = await db.update(leadsTable).set({
      currentFunnelStageId: stageContext === "funnel" ? stageId : undefined,
      currentStageId: stageContext === "pipeline" ? stageId : undefined,
      updatedAt: new Date(),
    }).where(eq(leadsTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    await db.insert(timelineEventsTable).values({
      entityType: "lead",
      entityId: req.params.id,
      eventType: "stage_changed",
      renderedTitle: `Stage moved`,
      renderedDescription: notes ?? undefined,
    });
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/leads/:id/score", requireAuth, async (req, res): Promise<void> => {
  try {
    const score = Math.floor(Math.random() * 40 + 60);
    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
    await db.update(leadsTable).set({ aiLeadScore: String(score), scoreGrade: grade, updatedAt: new Date() }).where(eq(leadsTable.id, req.params.id));
    res.json({ leadId: req.params.id, score, grade, breakdown: {} });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leads/:id/timeline", requireAuth, async (req, res): Promise<void> => {
  try {
    const events = await db.select().from(timelineEventsTable)
      .where(and(eq(timelineEventsTable.entityType, "lead"), eq(timelineEventsTable.entityId, req.params.id)))
      .orderBy(desc(timelineEventsTable.eventTimestamp)).limit(50);
    res.json(events);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
