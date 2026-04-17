import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import companiesRouter from "./companies";
import contactsRouter from "./contacts";
import leadsRouter from "./leads";
import opportunitiesRouter from "./opportunities";
import activitiesRouter from "./activities";
import notesRouter from "./notes";
import tasksRouter from "./tasks";
import notificationsRouter from "./notifications";
import pipelinesRouter from "./pipelines";
import funnelRouter from "./funnel";
import campaignsRouter from "./campaigns";
import workflowsRouter from "./workflows";
import scoringRouter from "./scoring";
import kpisRouter from "./kpis";
import conversationsRouter from "./conversations";
import templatesRouter from "./templates";
import integrationsRouter from "./integrations";
import dashboardRouter from "./dashboard";
import settingsRouter from "./settings";

// New routes added per implementation plan v5
import channelAccountsRouter from "./channel-accounts";
import customFieldsRouter from "./custom-fields";
import auditLogsRouter from "./audit-logs";
import botPersonasRouter from "./bot-personas";
import botFlowsRouter from "./bot-flows";
import agentAvailabilityRouter from "./agent-availability";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(companiesRouter);
router.use(contactsRouter);
router.use(leadsRouter);
router.use(opportunitiesRouter);
router.use(activitiesRouter);
router.use(notesRouter);
router.use(tasksRouter);
router.use(notificationsRouter);
router.use(pipelinesRouter);
router.use(funnelRouter);
router.use(campaignsRouter);
router.use(workflowsRouter);
router.use(scoringRouter);
router.use(kpisRouter);
router.use(conversationsRouter);
router.use(templatesRouter);
router.use(integrationsRouter);
router.use(dashboardRouter);
router.use(settingsRouter);

// New routes
router.use(channelAccountsRouter);
router.use(customFieldsRouter);
router.use(auditLogsRouter);
router.use(botPersonasRouter);
router.use(botFlowsRouter);
router.use(agentAvailabilityRouter);

export default router;
