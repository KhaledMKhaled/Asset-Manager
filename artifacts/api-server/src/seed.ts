import { db } from "./lib/db";
import { hashPassword } from "./lib/auth";
import {
  usersTable,
  companiesTable,
  contactsTable,
  leadsTable,
  pipelinesTable,
  pipelineStagesTable,
  funnelStagesTable,
  kpiDefinitionsTable,
  tasksTable,
} from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  // Admin user
  const passwordHash = await hashPassword("admin123");
  const [admin] = await db.insert(usersTable).values({
    name: "Admin User",
    email: "admin@smarketing.com",
    passwordHash,
    role: "admin",
    isActive: true,
  }).onConflictDoNothing().returning();
  console.log("Admin user:", admin?.id ?? "already exists");

  // Sales rep user
  const [salesRep] = await db.insert(usersTable).values({
    name: "Sarah Al-Rashidi",
    email: "sarah@smarketing.com",
    passwordHash: await hashPassword("sarah123"),
    role: "sales_rep",
    isActive: true,
  }).onConflictDoNothing().returning();

  // Support agent
  await db.insert(usersTable).values({
    name: "Ahmed Khalid",
    email: "ahmed@smarketing.com",
    passwordHash: await hashPassword("ahmed123"),
    role: "support_agent",
    isActive: true,
  }).onConflictDoNothing();

  // Funnel stages — columns: name, nameAr, stageType, color, position, isActive
  const funnelStageData = [
    { name: "Impression", position: 1, color: "#94a3b8", stageType: "marketing" },
    { name: "Lead Captured", position: 2, color: "#3b82f6", stageType: "marketing" },
    { name: "MQL", nameAr: "مؤهل تسويقياً", position: 3, color: "#8b5cf6", stageType: "marketing" },
    { name: "SQL", nameAr: "مؤهل مبيعياً", position: 4, color: "#f59e0b", stageType: "sales" },
    { name: "Demo Booked", position: 5, color: "#06b6d4", stageType: "sales" },
    { name: "Proposal Sent", position: 6, color: "#10b981", stageType: "sales" },
    { name: "Signed Up", position: 7, color: "#22c55e", stageType: "conversion" },
    { name: "Activated", position: 8, color: "#84cc16", stageType: "conversion" },
    { name: "Paid", position: 9, color: "#eab308", stageType: "conversion" },
  ];
  await db.insert(funnelStagesTable).values(funnelStageData).onConflictDoNothing();
  console.log("Funnel stages seeded");

  // Pipeline — columns: name, isDefault, description, pipelineType
  const [pipeline] = await db.insert(pipelinesTable).values({
    name: "Main Sales Pipeline",
    nameAr: "خط المبيعات الرئيسي",
    isDefault: true,
    description: "Primary B2B sales pipeline",
    pipelineType: "sales",
  }).onConflictDoNothing().returning();

  if (pipeline) {
    // Pipeline stages — columns: pipelineId, name, position, color, probability, stageType
    const pipelineStageData = [
      { pipelineId: pipeline.id, name: "New Lead", position: 1, color: "#3b82f6", probability: "10", stageType: "active", isEntry: true },
      { pipelineId: pipeline.id, name: "Discovery", position: 2, color: "#8b5cf6", probability: "25", stageType: "active" },
      { pipelineId: pipeline.id, name: "Demo", position: 3, color: "#06b6d4", probability: "50", stageType: "active" },
      { pipelineId: pipeline.id, name: "Proposal", position: 4, color: "#f59e0b", probability: "65", stageType: "active" },
      { pipelineId: pipeline.id, name: "Negotiation", position: 5, color: "#f97316", probability: "80", stageType: "active" },
      { pipelineId: pipeline.id, name: "Closed Won", position: 6, color: "#22c55e", probability: "100", stageType: "won", isExit: true },
      { pipelineId: pipeline.id, name: "Closed Lost", position: 7, color: "#ef4444", probability: "0", stageType: "lost", isExit: true },
    ];
    await db.insert(pipelineStagesTable).values(pipelineStageData).onConflictDoNothing();
    console.log("Pipeline stages seeded");
  }

  // KPI definitions — columns: name, kpiType, displayType, targetValue, isPinned, description, timeAggregation
  const kpiDefs = [
    { name: "Monthly Revenue (SAR)", nameAr: "الإيرادات الشهرية", kpiType: "revenue", displayType: "currency", targetValue: "500000", timeAggregation: "monthly", isPinned: true, description: "Total revenue collected per month" },
    { name: "Lead-to-MQL Rate", kpiType: "conversion", displayType: "percentage", targetValue: "35", timeAggregation: "monthly", isPinned: true, description: "% of leads that become MQL" },
    { name: "MQL-to-SQL Rate", kpiType: "conversion", displayType: "percentage", targetValue: "45", timeAggregation: "monthly", isPinned: true, description: "% of MQLs that become SQL" },
    { name: "SQL-to-Close Rate", kpiType: "conversion", displayType: "percentage", targetValue: "30", timeAggregation: "monthly", isPinned: true, description: "% of SQLs that close" },
    { name: "Average Deal Size", kpiType: "revenue", displayType: "currency", targetValue: "15000", timeAggregation: "all_time", isPinned: false, description: "Average SAR value of won deals" },
    { name: "Monthly Active Leads", kpiType: "pipeline", displayType: "number", targetValue: "200", timeAggregation: "monthly", isPinned: false, description: "Leads created this month" },
  ];
  await db.insert(kpiDefinitionsTable).values(kpiDefs).onConflictDoNothing();
  console.log("KPI definitions seeded");

  // Sample companies — columns: companyName, businessType, industry, city, country, companySize, website
  const companies = await db.insert(companiesTable).values([
    { companyName: "Takamol Technologies", businessType: "B2B", industry: "Technology", city: "Riyadh", country: "Saudi Arabia", companySize: "50-200", website: "https://takamol.sa" },
    { companyName: "Gulf Retail Group", businessType: "B2C", industry: "Retail", city: "Jeddah", country: "Saudi Arabia", companySize: "200-500" },
    { companyName: "Bayan Consulting", businessType: "B2B", industry: "Consulting", city: "Riyadh", country: "Saudi Arabia", companySize: "10-50" },
    { companyName: "Noor Health Solutions", businessType: "B2B", industry: "Healthcare", city: "Dammam", country: "Saudi Arabia", companySize: "50-200" },
    { companyName: "Future Logistics Co.", businessType: "B2B", industry: "Logistics", city: "Riyadh", country: "Saudi Arabia", companySize: "200-500" },
  ]).returning();
  console.log("Companies seeded:", companies.length);

  // Sample contacts
  const contacts = await db.insert(contactsTable).values([
    { fullName: "Mohammed Al-Zahrani", jobTitle: "CEO", email: "m.zahrani@takamol.sa", phone: "+966501234567", companyId: companies[0].id, leadSource: "meta_ads" },
    { fullName: "Fatima Hassan", jobTitle: "CMO", email: "f.hassan@gulfretail.com", phone: "+966512345678", companyId: companies[1].id, leadSource: "google_ads" },
    { fullName: "Khalid Al-Otaibi", jobTitle: "Director", email: "k.otaibi@bayan.com", phone: "+966523456789", companyId: companies[2].id, leadSource: "referral" },
    { fullName: "Sara Al-Malik", jobTitle: "CTO", email: "s.malik@noor.com", phone: "+966534567890", companyId: companies[3].id, leadSource: "website" },
    { fullName: "Omar Al-Qurashi", jobTitle: "COO", email: "o.qurashi@future.com", phone: "+966545678901", companyId: companies[4].id, leadSource: "cold_call" },
  ]).returning();
  console.log("Contacts seeded:", contacts.length);

  // Sample leads — check leadCode, leadStatus, qualificationStatus, aiLeadScore, scoreGrade, aiSummary
  const adminId = admin?.id;
  const salesRepId = salesRep?.id;
  const leads = await db.insert(leadsTable).values([
    {
      leadCode: "LD-0001",
      companyId: companies[0].id,
      primaryContactId: contacts[0].id,
      leadSource: "meta_ads",
      leadStatus: "qualified",
      qualificationStatus: "qualified",
      isMql: true,
      isSql: true,
      assignedTo: adminId,
      aiLeadScore: "82.00",
      scoreGrade: "B",
      aiSummary: "High-potential lead from Takamol Technologies. CEO is actively evaluating CRM solutions.",
      tags: ["hot", "tech"],
    },
    {
      leadCode: "LD-0002",
      companyId: companies[1].id,
      primaryContactId: contacts[1].id,
      leadSource: "google_ads",
      leadStatus: "nurturing",
      qualificationStatus: "mql",
      isMql: true,
      isSql: false,
      assignedTo: salesRepId ?? adminId,
      aiLeadScore: "65.00",
      scoreGrade: "C",
      tags: ["retail", "warm"],
    },
    {
      leadCode: "LD-0003",
      companyId: companies[2].id,
      primaryContactId: contacts[2].id,
      leadSource: "referral",
      leadStatus: "contacted",
      qualificationStatus: "new",
      isMql: false,
      isSql: false,
      assignedTo: adminId,
      aiLeadScore: "91.00",
      scoreGrade: "A",
      aiSummary: "Strong referral from existing client. High budget signals.",
      tags: ["A-grade", "consulting"],
    },
    {
      leadCode: "LD-0004",
      companyId: companies[3].id,
      primaryContactId: contacts[3].id,
      leadSource: "website",
      leadStatus: "new",
      qualificationStatus: "new",
      isMql: false,
      isSql: false,
      assignedTo: adminId,
      aiLeadScore: "48.00",
      scoreGrade: "D",
      tags: ["healthcare"],
    },
    {
      leadCode: "LD-0005",
      companyId: companies[4].id,
      primaryContactId: contacts[4].id,
      leadSource: "cold_call",
      leadStatus: "qualified",
      qualificationStatus: "sql",
      isMql: true,
      isSql: true,
      assignedTo: salesRepId ?? adminId,
      aiLeadScore: "77.00",
      scoreGrade: "B",
      tags: ["logistics", "enterprise"],
    },
  ]).onConflictDoNothing().returning();
  console.log("Leads seeded:", leads.length);

  // Sample tasks
  if (adminId && leads.length > 0) {
    await db.insert(tasksTable).values([
      { title: "Follow up with Mohammed Al-Zahrani", leadId: leads[0]?.id, assignedTo: adminId, priority: "high", status: "open", dueDate: new Date(Date.now() + 86400000) },
      { title: "Send proposal to Bayan Consulting", leadId: leads[2]?.id, assignedTo: adminId, priority: "urgent", status: "open", dueDate: new Date(Date.now() - 86400000) },
      { title: "Schedule demo call with Future Logistics", leadId: leads[4]?.id, assignedTo: salesRepId ?? adminId, priority: "medium", status: "open", dueDate: new Date(Date.now() + 3 * 86400000) },
      { title: "Update lead qualification notes for Gulf Retail", leadId: leads[1]?.id, assignedTo: salesRepId ?? adminId, priority: "low", status: "open" },
      { title: "Review Q1 campaign performance", assignedTo: adminId, priority: "medium", status: "completed" },
    ]).onConflictDoNothing();
    console.log("Tasks seeded");
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
