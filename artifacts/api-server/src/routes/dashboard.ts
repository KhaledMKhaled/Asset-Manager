import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../lib/auth";
import {
  leadsTable, opportunitiesTable, tasksTable, conversationsTable,
  funnelStagesTable, pipelinesTable, pipelineStagesTable,
  activitiesTable, timelineEventsTable, usersTable, kpiDefinitionsTable,
} from "@workspace/db";
import { eq, and, count, sum, avg, desc, sql, gte, lte, isNull } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      [{ totalLeads }],
      [{ totalMql }],
      [{ totalSql }],
      [{ totalSignups }],
      [{ totalActivations }],
      [{ totalPaid }],
      [{ totalRevenue }],
      [{ openOpportunities }],
      [{ openTasks }],
      [{ overdueTasks }],
      [{ openConversations }],
      [{ avgScore }],
      [{ newLeadsToday }],
      [{ newLeadsThisWeek }],
    ] = await Promise.all([
      db.select({ totalLeads: count() }).from(leadsTable),
      db.select({ totalMql: count() }).from(leadsTable).where(eq(leadsTable.isMql, true)),
      db.select({ totalSql: count() }).from(leadsTable).where(eq(leadsTable.isSql, true)),
      db.select({ totalSignups: count() }).from(opportunitiesTable).where(eq(opportunitiesTable.signupStatus, "completed")),
      db.select({ totalActivations: count() }).from(opportunitiesTable).where(eq(opportunitiesTable.activationStatus, "completed")),
      db.select({ totalPaid: count() }).from(opportunitiesTable).where(eq(opportunitiesTable.paidStatus, "completed")),
      db.select({ totalRevenue: sum(opportunitiesTable.finalRevenue) }).from(opportunitiesTable).where(eq(opportunitiesTable.paidStatus, "completed")),
      db.select({ openOpportunities: count() }).from(opportunitiesTable).where(eq(opportunitiesTable.status, "open")),
      db.select({ openTasks: count() }).from(tasksTable).where(eq(tasksTable.status, "open")),
      db.select({ overdueTasks: count() }).from(tasksTable).where(and(eq(tasksTable.status, "open"), lte(tasksTable.dueDate, new Date()))),
      db.select({ openConversations: count() }).from(conversationsTable).where(eq(conversationsTable.status, "open")),
      db.select({ avgScore: avg(leadsTable.leadScore) }).from(leadsTable),
      db.select({ newLeadsToday: count() }).from(leadsTable).where(gte(leadsTable.createdAt, todayStart)),
      db.select({ newLeadsThisWeek: count() }).from(leadsTable).where(gte(leadsTable.createdAt, weekStart)),
    ]);

    res.json({
      totalLeads: Number(totalLeads),
      totalMql: Number(totalMql),
      totalSql: Number(totalSql),
      totalSignups: Number(totalSignups),
      totalActivations: Number(totalActivations),
      totalPaid: Number(totalPaid),
      totalRevenue: Number(totalRevenue ?? 0),
      openOpportunities: Number(openOpportunities),
      openTasks: Number(openTasks),
      overdueTasks: Number(overdueTasks),
      openConversations: Number(openConversations),
      avgLeadScore: Number(avgScore ?? 0),
      newLeadsToday: Number(newLeadsToday),
      newLeadsThisWeek: Number(newLeadsThisWeek),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/funnel", requireAuth, async (req, res): Promise<void> => {
  try {
    const stages = await db.select().from(funnelStagesTable).where(eq(funnelStagesTable.isActive, true)).orderBy(funnelStagesTable.position);
    const result = await Promise.all(stages.map(async (stage) => {
      const [{ cnt }] = await db.select({ cnt: count() }).from(leadsTable).where(eq(leadsTable.currentFunnelStageId, stage.id));
      return {
        stageId: stage.id,
        stageName: stage.name,
        stageType: stage.stageType,
        color: stage.color,
        count: Number(cnt),
        position: stage.position,
      };
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/lead-sources", requireAuth, async (req, res): Promise<void> => {
  try {
    const rows = await db.select({
      source: leadsTable.leadSource,
      count: count(),
    }).from(leadsTable).groupBy(leadsTable.leadSource);
    const total = rows.reduce((s, r) => s + Number(r.count), 0);
    const result = rows.map((r) => ({
      source: r.source ?? "unknown",
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100 * 10) / 10 : 0,
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/pipeline-board", requireAuth, async (req, res): Promise<void> => {
  try {
    const pipelines = await db.select().from(pipelinesTable).where(eq(pipelinesTable.isDefault, true)).limit(1);
    const pipeline = pipelines[0];
    if (!pipeline) {
      res.json({ pipelineId: "", pipelineName: "No Pipeline", stages: [] });
      return;
    }
    const stages = await db.select().from(pipelineStagesTable).where(eq(pipelineStagesTable.pipelineId, pipeline.id)).orderBy(pipelineStagesTable.position);
    const boardStages = await Promise.all(stages.map(async (stage) => {
      const opps = await db.select().from(opportunitiesTable).where(eq(opportunitiesTable.currentStageId, stage.id));
      const totalValue = opps.reduce((s, o) => s + Number(o.amountExpected ?? 0), 0);
      return {
        stageId: stage.id,
        stageName: stage.name,
        color: stage.color,
        count: opps.length,
        totalValue,
        opportunities: opps,
      };
    }));
    res.json({ pipelineId: pipeline.id, pipelineName: pipeline.name, stages: boardStages });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string ?? "20") || 20;
    const events = await db.select().from(timelineEventsTable).orderBy(desc(timelineEventsTable.eventTimestamp)).limit(limit);
    const result = events.map((e) => ({
      id: e.id,
      type: e.eventType,
      title: e.renderedTitle ?? e.eventType,
      description: e.renderedDescription,
      entityType: e.entityType,
      entityId: e.entityId,
      userName: null,
      timestamp: e.eventTimestamp,
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/kpi-values", requireAuth, async (req, res): Promise<void> => {
  try {
    const kpis = await db.select().from(kpiDefinitionsTable).where(and(eq(kpiDefinitionsTable.isActive, true))).orderBy(kpiDefinitionsTable.position);
    const [{ totalLeads }] = await db.select({ totalLeads: count() }).from(leadsTable);
    const [{ totalMql }] = await db.select({ totalMql: count() }).from(leadsTable).where(eq(leadsTable.isMql, true));
    const [{ totalSql }] = await db.select({ totalSql: count() }).from(leadsTable).where(eq(leadsTable.isSql, true));
    const [{ totalRevenue }] = await db.select({ totalRevenue: sum(opportunitiesTable.finalRevenue) }).from(opportunitiesTable);

    const kpiValueMap: Record<string, number> = {
      total_leads: Number(totalLeads),
      mql_count: Number(totalMql),
      sql_count: Number(totalSql),
      total_revenue: Number(totalRevenue ?? 0),
    };

    const result = kpis.map((k) => {
      const value = kpiValueMap[k.kpiType] ?? null;
      const target = k.targetValue ? Number(k.targetValue) : null;
      let status = "normal";
      if (value !== null && k.warningThreshold !== null && k.dangerThreshold !== null) {
        const danger = Number(k.dangerThreshold);
        const warning = Number(k.warningThreshold);
        if (k.thresholdDirection === "higher_is_better") {
          status = value >= warning ? "normal" : value >= danger ? "warning" : "danger";
        } else {
          status = value <= warning ? "normal" : value <= danger ? "warning" : "danger";
        }
      }
      return {
        kpiId: k.id,
        name: k.name,
        nameAr: k.nameAr,
        value,
        displayType: k.displayType,
        kpiType: k.kpiType,
        targetValue: target,
        warningThreshold: k.warningThreshold ? Number(k.warningThreshold) : null,
        dangerThreshold: k.dangerThreshold ? Number(k.dangerThreshold) : null,
        thresholdDirection: k.thresholdDirection,
        status,
        isPinned: k.isPinned,
      };
    });
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/team-performance", requireAuth, async (req, res): Promise<void> => {
  try {
    const users = await db.select().from(usersTable).where(and(eq(usersTable.isActive, true))).limit(20);
    const result = await Promise.all(users.map(async (u) => {
      const [{ leads }] = await db.select({ leads: count() }).from(leadsTable).where(eq(leadsTable.assignedTo, u.id));
      const [{ done }] = await db.select({ done: count() }).from(tasksTable).where(and(eq(tasksTable.assignedTo, u.id), eq(tasksTable.status, "completed")));
      const [{ overdue }] = await db.select({ overdue: count() }).from(tasksTable).where(and(eq(tasksTable.assignedTo, u.id), eq(tasksTable.status, "open"), lte(tasksTable.dueDate, new Date())));
      const [{ calls }] = await db.select({ calls: count() }).from(activitiesTable).where(and(eq(activitiesTable.userId, u.id), eq(activitiesTable.activityType, "call")));
      const [{ revenue }] = await db.select({ revenue: sum(opportunitiesTable.finalRevenue) }).from(opportunitiesTable).where(and(eq(opportunitiesTable.assignedTo, u.id), eq(opportunitiesTable.status, "won")));
      const [{ won }] = await db.select({ won: count() }).from(opportunitiesTable).where(and(eq(opportunitiesTable.assignedTo, u.id), eq(opportunitiesTable.status, "won")));
      return {
        userId: u.id,
        userName: u.name,
        role: u.role,
        leadsAssigned: Number(leads),
        tasksDone: Number(done),
        tasksOverdue: Number(overdue),
        callsMade: Number(calls),
        dealsWon: Number(won),
        revenue: Number(revenue ?? 0),
      };
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/inbox-summary", requireAuth, async (req, res): Promise<void> => {
  try {
    const [
      [{ totalOpen }],
      [{ totalPending }],
      [{ totalResolved }],
      [{ slaBreached }],
    ] = await Promise.all([
      db.select({ totalOpen: count() }).from(conversationsTable).where(eq(conversationsTable.status, "open")),
      db.select({ totalPending: count() }).from(conversationsTable).where(eq(conversationsTable.status, "pending")),
      db.select({ totalResolved: count() }).from(conversationsTable).where(eq(conversationsTable.status, "resolved")),
      db.select({ slaBreached: count() }).from(conversationsTable).where(eq(conversationsTable.slaStatus, "breached")),
    ]);
    const channels = ["whatsapp", "messenger", "instagram"];
    const byChannel = await Promise.all(channels.map(async (ch) => {
      const [{ cnt }] = await db.select({ cnt: count() }).from(conversationsTable).where(and(eq(conversationsTable.channel, ch), eq(conversationsTable.status, "open")));
      const [{ unread }] = await db.select({ unread: sum(conversationsTable.unreadCount) }).from(conversationsTable).where(eq(conversationsTable.channel, ch));
      return { channel: ch, count: Number(cnt), unreadCount: Number(unread ?? 0) };
    }));
    const [{ totalUnread }] = await db.select({ totalUnread: sum(conversationsTable.unreadCount) }).from(conversationsTable);
    res.json({
      totalOpen: Number(totalOpen),
      totalUnread: Number(totalUnread ?? 0),
      totalPending: Number(totalPending),
      totalResolved: Number(totalResolved),
      byChannel,
      slaBreached: Number(slaBreached),
      avgResponseTimeMinutes: null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/score-distribution", requireAuth, async (req, res): Promise<void> => {
  try {
    const rows = await db.select({
      grade: leadsTable.scoreGrade,
      count: count(),
    }).from(leadsTable).groupBy(leadsTable.scoreGrade);
    const total = rows.reduce((s, r) => s + Number(r.count), 0);
    const result = rows.map((r) => ({
      grade: r.grade ?? "unscored",
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100 * 10) / 10 : 0,
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
