# Smarketing CRM System — Full Implementation Plan (v5 Final)

> [!NOTE]
> **v5 Merged Plan**: Consolidates original plan + CRM Product Spec + Dynamic Config Addendum + Omnichannel Messaging + **AI Continuity & Bot Persona Addendum**. All requirements unified. No conflicts.

## 🏛️ Platform Directive

> [!IMPORTANT]
> **The CRM must be designed as a configurable operating system, not a fixed-flow application.**
> 
> The business must be able to — without code changes:
> - Add/remove/reorder funnel & pipeline stages
> - Edit customer profile fields
> - Create and edit workflows with branching
> - Create and edit KPI definitions
> - Create and edit scoring models
> - Manage tasks and reminders
> - Configure notifications
> - Connect API integrations from the UI
> 
> This is critical because the business process, sales motion, scoring logic, and reporting model will evolve over time.

---

## 🎯 Project Vision

Build a **Revenue CRM + Smarketing Operating System** that unifies the complete customer journey:

**Meta Ads → Lead Capture → Messaging → Qualification → Sales Follow-up → Demo → Signup → Activation → Paid Subscription → Revenue**

The system serves **7 teams**: Management, Sales Agents, Sales Managers, Media Buying, Customer Success/Onboarding, Operations/Admin, **Messaging/Social**.

### Key Integrations
- **Meta Marketing API v25.0** — Campaign sync, lead ingestion, performance metrics
- **Meta Conversions API (CAPI)** — Server-side event tracking
- **WhatsApp Business API** — Messaging, templates, media exchange
- **Facebook Messenger API** — Page messaging, conversation sync
- **Instagram Messaging API** — DM sync, business messaging
- **OpenAI GPT-5.3 API** — Lead scoring, summarization, action recommendations
- **Google Gemini 3.1 API** — Sentiment analysis, intent classification, risk detection

### Product Principles
- **Funnel-first**, not contact-list-first
- **Timeline-centric** customer profile
- **Dynamic and configurable** — everything editable from UI
- **API-first** and integration-ready
- **AI-first, human-supervised** — AI handles continuity, humans handle decisions
- **Bilingual** — Arabic + English UI
- **Omnichannel** — WhatsApp, Messenger, Instagram in unified inbox
- **Always-on** — AI continuity covers agent absence, after-hours, and overload
- **Auditability and traceability** for all actions
- **Zero-code admin** — reduce engineering dependency

---

## 📐 System Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend - Next.js 15 App Router"]
        UI["React Components + Vanilla CSS"]
        Pages["Pages & Layouts - Bilingual AR/EN"]
        Charts["Recharts + Custom Visualizations"]
        i18n["i18n Layer - AR/EN + RTL"]
    end

    subgraph Backend["Backend - Next.js API Routes"]
        API["REST API Endpoints"]
        Auth["Auth - NextAuth.js v5 + RBAC"]
        WF["Workflow & Automation Engine"]
        AI["AI Orchestration Layer"]
        Score["Scoring Engine"]
        KPI["KPI Calculation Engine"]
        Tasks["Task Engine"]
        Notif["Notification & Reminder Engine"]
        Audit["Audit Service"]
    end

    subgraph External["External APIs"]
        Meta["Meta Marketing API v25.0"]
        CAPI["Meta Conversions API"]
        GPT["OpenAI GPT-5.3 API"]
        Gemini["Google Gemini 3.1 API"]
    end

    subgraph Data["Data Layer"]
        DB["PostgreSQL"]
        Cache["In-Memory Cache"]
    end

    Frontend --> Backend
    Backend --> External
    Backend --> Data
```

### Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 (App Router) | Full-stack React with API routes |
| **UI** | React + Vanilla CSS | Maximum design control, premium aesthetics |
| **Charts** | Recharts | Lightweight, React-native charting |
| **Database** | **PostgreSQL** | Production-grade, concurrent users, full SQL |
| **ORM** | Prisma | Type-safe DB access, migrations, schema management |
| **Auth** | NextAuth.js v5 | Role-based authentication (10 roles) |
| **AI** | OpenAI SDK + Google GenAI SDK | Dual AI providers for analysis |
| **Meta** | Meta Marketing API v25.0 | Ad data ingestion & lead retrieval |
| **Icons** | Lucide React | Modern icon set |
| **Fonts** | Inter + Cairo (Arabic) | Clean typography, bilingual support |
| **i18n** | next-intl | Bilingual Arabic/English support |

---

## 📊 Database Schema (PostgreSQL + Prisma)

### Entity Relationship Diagram

```mermaid
erDiagram
    Users ||--o{ Leads : "assigned_to"
    Users ||--o{ Activities : "performed_by"
    Users ||--o{ Tasks : "assigned_to"
    Users ||--o{ Notifications : "receives"
    
    Leads ||--o{ Contacts : "primary_contact"
    Leads ||--|| Companies : "belongs_to"
    Leads ||--o{ Opportunities : "has"
    Leads ||--o{ Activities : "has"
    Leads ||--o{ Notes : "has"
    Leads ||--o{ TimelineEvents : "has"
    Leads ||--o{ LeadStageHistory : "has"
    Leads ||--o{ LeadScoreHistory : "has"
    
    Companies ||--o{ Contacts : "has"
    Companies ||--o{ Opportunities : "has"
    
    Opportunities ||--o{ Activities : "has"
    Opportunities ||--|| PipelineStages : "current_stage"
    
    Campaigns ||--o{ AdSets : "has"
    AdSets ||--o{ Ads : "has"
    Campaigns ||--o{ MetaAdData : "has"
    Campaigns ||--o{ Leads : "source"
    
    FunnelStages ||--o{ Leads : "current_funnel"
    Pipelines ||--o{ PipelineStages : "contains"
    
    Workflows ||--o{ WorkflowStages : "contains"
    Workflows ||--o{ AutomationRules : "has"
    AutomationRules ||--o{ WorkflowExecutionLogs : "logged_by"
    
    ScoringModels ||--o{ ScoringRules : "contains"
    KPIDefinitions ||--o{ KPISnapshots : "tracked_by"
    
    Integrations ||--o{ IntegrationLogs : "logs"
```

### Full Table Definitions

```sql
-- ═══════════════════════════════════════
-- USERS & AUTH
-- ═══════════════════════════════════════

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'sales_rep',
    -- roles: super_admin, admin, sales_manager, sales_rep, 
    --        media_buyer, management_viewer, onboarding_agent, analyst
    team VARCHAR(100),
    avatar_url TEXT,
    language VARCHAR(5) DEFAULT 'ar', -- ar | en
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- CORE CRM ENTITIES
-- ═══════════════════════════════════════

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    company_size VARCHAR(50), -- solo|small|medium|large
    branch_count INTEGER DEFAULT 1,
    tax_profile_status VARCHAR(50), -- none|basic|e_invoice|e_receipt|both
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Egypt',
    website VARCHAR(255),
    current_system VARCHAR(255),
    use_case_tags TEXT[], -- PostgreSQL array
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    job_title VARCHAR(100),
    preferred_contact_method VARCHAR(20) DEFAULT 'phone',
    language VARCHAR(5) DEFAULT 'ar',
    notes_summary TEXT,
    is_primary BOOLEAN DEFAULT false,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_code VARCHAR(50) UNIQUE NOT NULL, -- L-2026-00458
    company_id UUID REFERENCES companies(id),
    primary_contact_id UUID REFERENCES contacts(id),
    campaign_id UUID REFERENCES campaigns(id),
    campaign_key VARCHAR(100),
    pipeline_id UUID,
    current_stage_id UUID,
    current_funnel_stage_id UUID,
    assigned_to UUID REFERENCES users(id),
    
    -- Source & Attribution
    lead_source VARCHAR(50), -- meta|organic|referral|direct|whatsapp|outbound
    source_channel VARCHAR(50), -- paid_social|organic_social|search|direct|partner
    platform VARCHAR(20), -- meta|google|tiktok|direct
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    first_touch_source VARCHAR(100),
    last_touch_source VARCHAR(100),
    
    -- Status & Qualification
    lead_status VARCHAR(50) DEFAULT 'new',
    contact_status VARCHAR(50) DEFAULT 'not_contacted',
    qualification_status VARCHAR(50) DEFAULT 'pending',
    qualification_reason TEXT,
    is_mql BOOLEAN DEFAULT false,
    is_sql BOOLEAN DEFAULT false,
    
    -- Scoring
    lead_score DECIMAL(5,2) DEFAULT 0, -- manual 0-100
    ai_lead_score DECIMAL(5,2) DEFAULT 0, -- AI 0-100
    score_grade VARCHAR(1), -- A|B|C|D|F
    active_scoring_model_id UUID,
    
    -- AI
    ai_summary TEXT,
    
    -- SLA
    first_response_at TIMESTAMPTZ,
    response_time_minutes DECIMAL(10,2),
    sla_met BOOLEAN,
    
    -- Flags
    duplicate_flag BOOLEAN DEFAULT false,
    
    -- Dynamic
    custom_fields JSONB DEFAULT '{}',
    tags TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    company_id UUID REFERENCES companies(id),
    pipeline_id UUID,
    current_stage_id UUID,
    assigned_to UUID REFERENCES users(id),
    
    opportunity_name VARCHAR(255),
    amount_expected DECIMAL(12,2),
    plan_interest VARCHAR(100),
    close_probability DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'open', -- open|won|lost
    won_lost_reason TEXT,
    expected_close_date DATE,
    
    -- Lifecycle
    signup_status VARCHAR(20) DEFAULT 'not_signed',
    signup_date TIMESTAMPTZ,
    activation_status VARCHAR(20) DEFAULT 'not_activated',
    activation_date TIMESTAMPTZ,
    activation_criteria_met TEXT,
    paid_status VARCHAR(20) DEFAULT 'unpaid',
    payment_date TIMESTAMPTZ,
    
    -- Revenue
    plan_name VARCHAR(100),
    contract_value DECIMAL(12,2),
    billing_cycle VARCHAR(20), -- monthly|yearly
    discount_applied DECIMAL(5,2),
    final_revenue DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'EGP',
    lost_reason VARCHAR(255),
    
    -- Follow-up
    followup_count INTEGER DEFAULT 0,
    last_followup_date TIMESTAMPTZ,
    onboarding_owner VARCHAR(255),
    
    -- Dynamic
    custom_fields JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- ACTIVITIES, NOTES, TIMELINE
-- ═══════════════════════════════════════

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL, -- lead|contact|company|opportunity
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(30) NOT NULL,
    direction VARCHAR(10), -- inbound|outbound
    activity_datetime TIMESTAMPTZ DEFAULT NOW(),
    subject VARCHAR(255),
    content TEXT,
    outcome VARCHAR(100),
    next_step TEXT,
    due_date DATE,
    duration_seconds INTEGER,
    reached_customer BOOLEAN,
    decision_maker_present BOOLEAN,
    interest_level VARCHAR(20),
    objections TEXT[],
    recording_link TEXT,
    attachment_urls TEXT[],
    ai_summary TEXT,
    ai_sentiment VARCHAR(20),
    ai_action_items TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL,
    entity_id UUID NOT NULL,
    created_by UUID REFERENCES users(id),
    note_body TEXT NOT NULL,
    note_type VARCHAR(30) DEFAULT 'general',
    is_pinned BOOLEAN DEFAULT false,
    template_used VARCHAR(100),
    ai_tags TEXT[],
    ai_summary TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL,
    entity_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    rendered_title VARCHAR(500),
    rendered_description TEXT,
    source_system VARCHAR(20), -- manual|meta|ai|workflow|system
    reference_id UUID,
    visibility_scope VARCHAR(10) DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- TASKS & REMINDERS
-- ═══════════════════════════════════════

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20),
    entity_id UUID,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(30) DEFAULT 'general',
    -- types: call|followup|meeting|onboarding|payment_followup|document_collection|internal_review
    priority VARCHAR(10) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    source VARCHAR(20) DEFAULT 'manual',
    -- source: manual|workflow|stage_required|recurring
    due_date TIMESTAMPTZ,
    snoozed_until TIMESTAMPTZ,
    checklist JSONB DEFAULT '[]',
    attachments TEXT[],
    result TEXT,
    completion_notes TEXT,
    completed_at TIMESTAMPTZ,
    recurring_config JSONB, -- for recurring tasks
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id),
    user_id UUID REFERENCES users(id),
    reminder_type VARCHAR(20) NOT NULL,
    -- types: immediate|scheduled|repeated|escalation
    trigger_at TIMESTAMPTZ NOT NULL,
    repeat_interval_minutes INTEGER, -- for repeated reminders
    escalation_level INTEGER DEFAULT 0,
    priority VARCHAR(10),
    stage_filter VARCHAR(100), -- optional: only for specific stages
    task_type_filter VARCHAR(30), -- optional: only for specific task types
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- DYNAMIC FUNNEL
-- ═══════════════════════════════════════

CREATE TABLE funnel_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    stage_type VARCHAR(20) DEFAULT 'standard',
    -- types: standard|success|lost|paused
    color VARCHAR(20),
    icon VARCHAR(50),
    position INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_mandatory_in_reporting BOOLEAN DEFAULT true,
    sla_hours INTEGER,
    required_fields JSONB DEFAULT '[]',
    entry_conditions JSONB DEFAULT '{}',
    exit_conditions JSONB DEFAULT '{}',
    auto_create_tasks JSONB DEFAULT '[]',
    auto_create_checklist JSONB DEFAULT '[]',
    requires_manager_approval BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- DYNAMIC PIPELINES
-- ═══════════════════════════════════════

CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    description TEXT,
    pipeline_type VARCHAR(30) DEFAULT 'sales',
    -- types: sales|onboarding|renewal|enterprise|partner|custom
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    visible_to_teams TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    color VARCHAR(20),
    icon VARCHAR(50),
    position INTEGER NOT NULL,
    stage_type VARCHAR(20) DEFAULT 'standard',
    -- types: standard|success|lost|paused
    is_entry BOOLEAN DEFAULT false,
    is_exit BOOLEAN DEFAULT false,
    exit_type VARCHAR(10), -- won|lost
    probability DECIMAL(5,2),
    sla_hours INTEGER,
    required_fields JSONB DEFAULT '[]',
    checklist_template JSONB DEFAULT '[]',
    task_templates JSONB DEFAULT '[]',
    requires_approval BOOLEAN DEFAULT false,
    approval_roles TEXT[],
    default_owner_rule JSONB,
    automation_rules JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    from_stage_id UUID,
    to_stage_id UUID,
    stage_context VARCHAR(20), -- funnel|pipeline  
    changed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- CAMPAIGNS & META
-- ═══════════════════════════════════════

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_key VARCHAR(100) UNIQUE,
    platform VARCHAR(20),
    external_campaign_id VARCHAR(100),
    campaign_name VARCHAR(255) NOT NULL,
    campaign_objective VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    offer_angle VARCHAR(255),
    audience_type VARCHAR(50),
    geography VARCHAR(100),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ad_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    external_ad_set_id VARCHAR(100),
    ad_set_name VARCHAR(255),
    audience_type VARCHAR(50),
    geography VARCHAR(100),
    placement VARCHAR(50),
    optimization_goal VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_set_id UUID REFERENCES ad_sets(id),
    external_ad_id VARCHAR(100),
    ad_name VARCHAR(255),
    creative_type VARCHAR(20),
    creative_angle VARCHAR(255),
    offer_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meta_ad_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    ad_set_id UUID REFERENCES ad_sets(id),
    ad_id UUID REFERENCES ads(id),
    campaign_key VARCHAR(100),
    date DATE NOT NULL,
    spend DECIMAL(12,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    frequency DECIMAL(5,2),
    clicks_all INTEGER DEFAULT 0,
    link_clicks INTEGER DEFAULT 0,
    landing_page_views INTEGER DEFAULT 0,
    ctr_all DECIMAL(8,4),
    link_ctr DECIMAL(8,4),
    cpc_all DECIMAL(8,2),
    cpc_link DECIMAL(8,2),
    cpm DECIMAL(8,2),
    meta_form_leads INTEGER DEFAULT 0,
    website_leads INTEGER DEFAULT 0,
    leads_total INTEGER DEFAULT 0,
    signups INTEGER DEFAULT 0,
    cpl DECIMAL(8,2),
    cost_per_signup DECIMAL(8,2),
    budget_type VARCHAR(20),
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- SUBSCRIPTIONS & REVENUE
-- ═══════════════════════════════════════

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id),
    company_id UUID REFERENCES companies(id),
    plan_name VARCHAR(100),
    billing_cycle VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_date TIMESTAMPTZ,
    gross_revenue DECIMAL(12,2),
    discount_amount DECIMAL(12,2),
    net_revenue DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'EGP',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'trial',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- WORKFLOWS & AUTOMATION
-- ═══════════════════════════════════════

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    description TEXT,
    type VARCHAR(30) DEFAULT 'custom',
    applies_to VARCHAR(30) DEFAULT 'lead',
    -- applies_to: lead|contact|company|opportunity|task|all
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_testable BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    icon VARCHAR(50),
    position INTEGER NOT NULL,
    is_entry BOOLEAN DEFAULT false,
    is_exit BOOLEAN DEFAULT false,
    exit_type VARCHAR(10),
    automation_rules JSONB DEFAULT '[]',
    sla_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    trigger_event VARCHAR(50) NOT NULL,
    conditions JSONB DEFAULT '[]',
    action_type VARCHAR(50) NOT NULL,
    action_params JSONB DEFAULT '{}',
    -- Branching
    branch_conditions JSONB, -- if/else branching logic
    fallback_action JSONB, -- action if conditions fail
    -- Delays
    delay_minutes INTEGER DEFAULT 0, -- wait step
    -- Execution
    execution_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_rule_id UUID REFERENCES automation_rules(id),
    workflow_id UUID REFERENCES workflows(id),
    entity_type VARCHAR(20),
    entity_id UUID,
    trigger_event VARCHAR(50),
    conditions_met BOOLEAN,
    action_executed VARCHAR(50),
    action_result JSONB,
    status VARCHAR(20), -- success|failed|skipped|delayed
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- DYNAMIC SCORING
-- ═══════════════════════════════════════

CREATE TABLE scoring_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    description TEXT,
    entity_type VARCHAR(20) DEFAULT 'lead', -- lead|opportunity
    pipeline_id UUID REFERENCES pipelines(id),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    total_weight DECIMAL(5,2) DEFAULT 100,
    grade_thresholds JSONB DEFAULT '{"A":80,"B":60,"C":40,"D":20,"F":0}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES scoring_models(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    -- categories: company_fit|engagement|source_quality|behavioral|ai_analysis
    rule_name VARCHAR(100) NOT NULL,
    rule_name_ar VARCHAR(100),
    description TEXT,
    field_or_condition VARCHAR(255), -- field name or condition expression
    operator VARCHAR(20), -- equals|contains|gt|lt|gte|lte|in|not_in|exists
    value JSONB, -- expected value(s)
    score_value DECIMAL(5,2) NOT NULL, -- can be NEGATIVE
    weight DECIMAL(5,2) DEFAULT 1.0,
    is_negative BOOLEAN DEFAULT false,
    is_ai_rule BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    scoring_model_id UUID REFERENCES scoring_models(id),
    old_score DECIMAL(5,2),
    new_score DECIMAL(5,2),
    old_grade VARCHAR(1),
    new_grade VARCHAR(1),
    score_type VARCHAR(20), -- manual|ai|rule_based|recalculation
    scoring_breakdown JSONB, -- detailed per-rule breakdown
    changed_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- DYNAMIC KPI BUILDER
-- ═══════════════════════════════════════

CREATE TABLE kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    description TEXT,
    kpi_type VARCHAR(30) NOT NULL,
    -- types: count|conversion|cost|revenue|sla|efficiency|ai_derived
    formula JSONB NOT NULL,
    -- formula: { "type": "divide", "numerator": "spend", "denominator": "paid_count" }
    source_entity VARCHAR(30), -- lead|opportunity|campaign|meta_ad_data|activity
    source_fields TEXT[],
    display_type VARCHAR(20) DEFAULT 'number',
    -- display: number|percentage|currency|ratio|trend
    format_options JSONB DEFAULT '{}',
    -- format: { "decimals": 2, "prefix": "EGP ", "suffix": "%" }
    time_aggregation VARCHAR(20) DEFAULT 'daily',
    -- aggregation: daily|weekly|monthly|quarterly|yearly|all_time
    target_value DECIMAL(12,2),
    warning_threshold DECIMAL(12,2),
    danger_threshold DECIMAL(12,2),
    threshold_direction VARCHAR(10) DEFAULT 'lower_bad',
    -- direction: lower_bad (CAC) | higher_bad (churn) | target_exact
    visible_to_dashboards TEXT[],
    visible_to_teams TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    compare_by TEXT[], -- date|campaign|owner|stage|source
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID REFERENCES kpi_definitions(id),
    date DATE NOT NULL,
    value DECIMAL(12,4),
    dimensions JSONB DEFAULT '{}',
    -- dimensions: { "campaign": "X", "owner": "Y" }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- DYNAMIC FIELDS
-- ═══════════════════════════════════════

CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_label_en VARCHAR(100),
    field_label_ar VARCHAR(100),
    field_type VARCHAR(30) NOT NULL,
    -- types: text|long_text|number|currency|percentage|date|datetime|phone|
    --        email|select|multi_select|checkbox|boolean|relation|formula|ai_generated
    options JSONB, -- for select/multi-select
    is_required BOOLEAN DEFAULT false,
    required_in_stages TEXT[], -- stage IDs where field is required
    default_value TEXT,
    conditional_visibility JSONB, -- rules for when to show/hide
    conditional_validation JSONB, -- rules for validation
    visible_to_roles TEXT[], -- role-based visibility
    visible_to_teams TEXT[], -- team-based visibility
    field_group VARCHAR(100),
    field_section VARCHAR(100), -- sections within profile
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- INTEGRATIONS
-- ═══════════════════════════════════════

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL, -- meta|openai|gemini|custom
    provider_label VARCHAR(100),
    auth_type VARCHAR(20) NOT NULL, -- api_key|oauth|webhook|admin_assisted
    credentials JSONB DEFAULT '{}', -- encrypted storage
    config JSONB DEFAULT '{}', -- model, tokens, temperature, etc.
    status VARCHAR(20) DEFAULT 'disconnected',
    -- status: connected|disconnected|error|pending
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES integrations(id),
    action VARCHAR(50), -- sync|webhook|api_call|test_connection
    direction VARCHAR(10), -- inbound|outbound
    status VARCHAR(20), -- success|failed|partial
    request_summary TEXT,
    response_summary TEXT,
    records_affected INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- AI ANALYSIS
-- ═══════════════════════════════════════

CREATE TABLE ai_analysis_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID,
    entity_type VARCHAR(20),
    activity_id UUID REFERENCES activities(id),
    provider VARCHAR(20), -- openai|gemini
    model VARCHAR(50),
    analysis_type VARCHAR(50),
    prompt TEXT,
    result TEXT,
    confidence DECIMAL(5,2),
    cost DECIMAL(8,4),
    accepted_by_user BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- AUDIT & SETTINGS
-- ═══════════════════════════════════════

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(30),
    entity_id UUID,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    category VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🏆 Client Scoring System

### Scoring Architecture

```mermaid
flowchart TB
    subgraph Input["Scoring Inputs"]
        Profile["Lead Profile Data"]
        Activity["Activity History"]
        Campaign["Campaign Source"]
        Behavior["Behavioral Signals"]
        AI_Input["AI Analysis Results"]
    end

    subgraph Engine["Scoring Engine"]
        Model["Active Scoring Model"]
        Rules["Rule Evaluator +/- Points"]
        AI_Score["AI Scorer - GPT/Gemini"]
        Neg["Negative Rule Evaluator"]
        Combine["Weighted Score Combiner"]
    end

    subgraph Output["Score Output"]
        Total["Total Score 0-100"]
        Breakdown["Per-Rule Breakdown"]
        Grade["Grade A/B/C/D/F"]
        History["Score History Log"]
        Actions["Triggered Automations"]
    end

    Input --> Engine
    Engine --> Output
```

### Default Scoring Criteria

| Category | Weight | Rule | Points |
|----------|--------|------|--------|
| **Company Fit** | 25% | Business type match | +10 |
| | | Branch count > 3 | +20 |
| | | Tax profile needed | +7 |
| | | Decision maker confirmed | +15 |
| **Engagement** | 25% | Responded to first contact | +8 |
| | | ≥ 3 interactions | +7 |
| | | Demo completed | +5 |
| | | No response after 3 attempts | **-10** |
| **Source Quality** | 20% | Source = Meta high-intent form | +10 |
| | | Complete UTM attribution | +5 |
| | | Budget mismatch | **-15** |
| **Behavioral** | 15% | Interest level = high/very_high | +5 |
| | | Signup completed | +25 |
| | | Activation completed | +30 |
| **AI Analysis** | 15% | Positive sentiment | +5 |
| | | High purchase intent | +5 |
| | | Drop-off risk detected | **-10** |

### Admin Scoring Configuration
- Create multiple scoring models per pipeline/business unit
- Add/remove/edit rules with positive OR negative values
- Preview score impact before publishing
- Activate/deactivate models
- View score distribution across all leads

---

## 🔧 Dynamic KPI Builder

> [!IMPORTANT]
> **KPIs are NOT hard-coded.** Admin can add, edit, remove, and configure KPIs from the UI.

### KPI Types

| Type | Example KPIs |
|------|-------------|
| **Count** | Total Leads, Total Paid, Total Signups |
| **Conversion** | Lead→MQL %, MQL→SQL %, Signup→Paid % |
| **Cost** | CPL, Cost/Signup, Cost/Activation, CAC |
| **Revenue** | Total Revenue, Revenue/Campaign, Revenue/Rep |
| **SLA** | Response SLA %, Overdue Tasks %, Contact Rate |
| **Efficiency** | ROAS, LTV:CAC Ratio, Lost Rate |
| **AI-derived** | Avg Lead Score, Risk Lead Count |

### KPI Configuration UI

```
┌──────────────────────────────────────────────────────────┐
│  📊 KPI Builder                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Name:           [Customer Acquisition Cost    ]         │
│  Name (AR):      [تكلفة اكتساب العميل         ]         │
│  Type:           [Cost                    ▼]             │
│  Formula:        [Spend] ÷ [Paid Customers]              │
│  Display:        [Currency               ▼]              │
│  Format:         Prefix: [EGP ] Decimals: [2]            │
│  Aggregation:    [Monthly                ▼]              │
│  Target:         [500         ]                          │
│  Warning:        [> 700       ] ⚠️                       │
│  Danger:         [> 1000      ] 🔴                       │
│  Direction:      [Lower is better        ▼]              │
│  Compare by:     [✓] Campaign [✓] Owner [✓] Date         │
│  Visible to:     [✓] Executive [✓] Smarketing            │
│  Pinned:         [✓]                                     │
│                                                          │
│  [Preview] [Save] [Delete]                               │
└──────────────────────────────────────────────────────────┘
```

### Default KPIs (Pre-configured)

| # | KPI | Formula | Type | Dashboard |
|---|-----|---------|------|-----------|
| 1 | CPL | Spend / Leads | Cost | Media, Exec |
| 2 | Cost/MQL | Spend / MQL_count | Cost | Smarketing |
| 3 | Cost/SQL | Spend / SQL_count | Cost | Smarketing |
| 4 | Cost/Signup | Spend / Signups | Cost | Media, Exec |
| 5 | Cost/Activation | Spend / Activations | Cost | Exec |
| 6 | CAC | Spend / Paid | Cost | All |
| 7 | ROAS | Revenue / Spend | Revenue | All |
| 8 | Lead→MQL % | MQL / Leads | Conversion | Smarketing |
| 9 | MQL→SQL % | SQL / MQL | Conversion | Smarketing |
| 10 | SQL→Signup % | Signups / SQL | Conversion | Smarketing |
| 11 | Signup→Activation % | Activations / Signups | Conversion | Smarketing |
| 12 | Activation→Paid % | Paid / Activations | Conversion | Smarketing |
| 13 | Response SLA % | SLA_met / Total | SLA | Sales |
| 14 | Win Rate | Won / Total_opps | Efficiency | Sales, Exec |
| 15 | Lost Rate | Lost / Total_opps | Efficiency | Sales |
| 16 | Avg Lead Score | AVG(lead_score) | AI | Exec |

---

## 🔄 Enhanced Dynamic Funnel

### Funnel Stage Types
| Type | Behavior | Example |
|------|----------|---------|
| **Standard** | Normal progression stage | MQL, SQL, Demo |
| **Success** | Positive completion | Won, Paid, Activated |
| **Lost** | Negative completion | Lost, Disqualified |
| **Paused** | Temporarily held | On Hold, Deferred |

### Funnel Stage Configuration
Each stage supports:
- Name (EN + AR)
- Type, Color, Icon
- Position (drag to reorder)
- Active/Inactive toggle
- Mandatory in reporting flag
- SLA hours
- Required fields before entry
- Entry/Exit conditions (rules)
- Auto-create tasks on entry
- Auto-create checklists on entry
- Manager approval required flag

---

## 🔧 Enhanced Workflow Builder

### New Capabilities (beyond v2)

| Capability | Description |
|-----------|-------------|
| **Clone workflow** | Duplicate an existing workflow |
| **Delay/Wait steps** | Add timed delays between actions |
| **Branching logic** | If/else conditions for different paths |
| **Fallback actions** | Default action if conditions fail |
| **Test mode** | Test workflow before activating |
| **Cross-module** | Workflows apply to leads, contacts, companies, opportunities, tasks — not just leads |
| **Execution history** | Full log of every execution with status |

### Workflow Builder UI

```
┌──────────────────────────────────────────────────────────┐
│  ⚙️ Workflow Builder: New Lead Processing                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Clone] [Test] [Save] [Enable/Disable]                  │
│                                                          │
│  Applies to: [Lead ▼]                                    │
│                                                          │
│  TRIGGER: [Lead Created ▼]                               │
│      │                                                   │
│      ▼                                                   │
│  CONDITION: Source = Meta?                                │
│      ├── YES ─────────────────────────┐                  │
│      │   ACTION: Assign to Sales Team  │                  │
│      │      │                          │                  │
│      │      ▼                          │                  │
│      │   WAIT: 5 minutes               │                  │
│      │      │                          │                  │
│      │      ▼                          │                  │
│      │   ACTION: Run AI Lead Scoring    │                  │
│      │      │                          │                  │
│      │      ▼                          │                  │
│      │   CONDITION: Score > 70?         │                  │
│      │      ├── YES: Create urgent task │                  │
│      │      └── NO: Standard task       │                  │
│      │                                 │                  │
│      └── NO ──────────────────────────┐│                  │
│          FALLBACK: Assign to general   ││                  │
│          queue, create standard task   ││                  │
│                                       ││                  │
│  [+ Add Step]                         ││                  │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Enhanced Task Center

### Task Types
| Type | Icon | Use Case |
|------|------|----------|
| `call` | 📞 | Schedule a call |
| `followup` | 🔄 | Follow up on previous contact |
| `meeting` | 🤝 | Schedule meeting/demo |
| `onboarding` | 🚀 | Onboarding step |
| `payment_followup` | 💳 | Payment collection |
| `document_collection` | 📄 | Collect required documents |
| `internal_review` | 📋 | Internal review/approval |

### Task Views
| View | Description |
|------|------------|
| **My Tasks** | Personal task list with filters |
| **Team Tasks** | Manager view of team tasks |
| **Calendar View** | Tasks on a calendar |
| **Kanban View** | Tasks by status columns |
| **Overdue** | All overdue tasks |
| **Today** | Due today |
| **Upcoming** | Next 7 days |

### Task Features
- Link to lead/contact/company/opportunity
- Checklist (sub-tasks)
- Attachments
- Snooze with reschedule
- Reassign
- Completion notes
- Bulk update
- Recurring tasks

---

## 🔔 Enhanced Notification & Reminder Engine

### Notification Types
| Event | Recipients |
|-------|-----------|
| New lead assigned | Assigned agent |
| Task created | Task owner |
| Task becoming due | Task owner (configurable before) |
| Task overdue | Task owner + manager |
| SLA breach | Manager |
| Stage changed | Owner + manager |
| High-priority lead | Assigned agent |
| Payment received | Sales + management |
| Activation completed | Onboarding + management |
| AI flagged high-risk | Assigned agent + manager |
| Workflow failure | Admin |

### Reminder Types
| Type | Behavior |
|------|----------|
| **Immediate** | Fires right away |
| **Scheduled** | Fires at specific time |
| **Repeated** | Fires every X minutes until acknowledged |
| **Escalation** | If not acknowledged, escalate to manager |

### Reminder Configuration
- By priority (urgent tasks get more aggressive reminders)
- By stage (specific stages get automatic reminders)
- By task type (call tasks get 15-min-before reminder)

### Delivery Channels
- **Phase 1**: In-app notifications
- **Future**: Email, WhatsApp/SMS, Push notifications

---

## 🔌 Enhanced Integration Center

### Integration Management UI

```
┌──────────────────────────────────────────────────────────┐
│  🔌 Integration Center                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Add Integration]                                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔷 Meta Platform           [Connected ✅] [Edit]   │  │
│  │   Auth: OAuth + API Key                            │  │
│  │   Last sync: 2 hours ago | Records: 1,247          │  │
│  │   [View Logs] [Manual Sync] [Disable] [Rotate Key] │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🤖 OpenAI (ChatGPT)       [Connected ✅] [Edit]   │  │
│  │   Auth: API Key                                    │  │
│  │   Model: gpt-5.3-instant | Calls today: 45        │  │
│  │   [View Logs] [Test] [Disable] [Rotate Key]        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 💎 Google Gemini           [Not Connected ⚠️]      │  │
│  │   Auth: API Key                                    │  │
│  │   [Configure]                                      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📊 Integration Health                                   │
│  ├── Meta: ✅ 99.8% success rate (last 24h)              │
│  ├── OpenAI: ✅ 100% success rate                         │
│  └── Gemini: ⚠️ Not configured                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Auth Type Support
| Provider | Auth Type | Setup Flow |
|----------|----------|------------|
| OpenAI | API Key | Paste key → Test → Save |
| Gemini | API Key | Paste key → Test → Save |
| Meta Ads | OAuth + API Key | Multi-step guided setup |
| WhatsApp Business | Token + Webhook | Token entry → Webhook config → Test |
| Facebook Messenger | Page Token + OAuth | Page selection → OAuth → Webhook |
| Instagram | Page Token + OAuth | Account selection → OAuth → Webhook |
| Custom | Varies | Admin-assisted |

### Integration Features
- Add/remove integrations dynamically
- Test connection before saving
- View detailed sync/call logs
- Monitor success rates
- Trigger manual syncs
- Rotate/update credentials
- Enable/disable individual integrations
- Cost monitoring for AI providers
- Channel account management (select page/account/number)
- Default team/owner/queue per channel
- Business hours profile per channel

---

## 📋 Phased Execution Plan (11 Scopes)

### Scope 1: Foundation
1. Next.js 15 project setup (App Router)
2. PostgreSQL + Prisma setup with full schema (all tables)
3. Design system (globals.css — dark theme, glassmorphism, RTL/LTR)
4. Bilingual i18n setup (Arabic + English with next-intl)
5. Authentication (login + NextAuth.js + 10 roles + RBAC)
6. App shell (sidebar, header, language switcher, role guard)
7. UI components library (Button, Card, Table, KPICard, Modal, Badge, etc.)
8. Seed data (demo users, sample funnel, default pipeline)

### Scope 2: Core CRM Entities
9. Company CRUD (list, create, detail, edit)
10. Contact CRUD (list, create, detail, edit)
11. Lead CRUD (list with filters/search, create, detail, edit)
12. Entity linking (Lead ↔ Contact ↔ Company)
13. Duplicate detection (phone/email)
14. Custom fields rendering engine
15. Dynamic Field Builder admin UI

### Scope 3: Customer Profile & Timeline
16. Lead/Contact/Company profile pages with all tabs (including Messaging tab)
17. Timeline system (event ingestion + rendering + filtering)
18. Activity logging (all types with structured forms)
19. Notes system (types, templates, pinning, rich text)
20. Structured call logs with outcome forms
21. Timeline search, filter, expand/collapse, export

### Scope 4: Client Scoring System
22. Scoring engine (rule evaluator + AI scorer + combiner)
23. Scoring model CRUD (admin creates/edits models)
24. Scoring rules CRUD (positive + negative rules, including messaging rules)
25. Score badge on all lead views (cards, kanban, lists)
26. Score breakdown panel (per-rule detail)
27. Score history chart + distribution dashboard
28. Scoring configuration admin UI
29. Scoring model preview (test before publish)

### Scope 5: Pipeline & Opportunity Management
30. Dynamic Pipeline CRUD (admin — create, archive, team visibility)
31. Pipeline stages (rules, checklists, SLAs, approval, task templates)
32. Dynamic Funnel stages (types, conditions, approval)
33. Opportunity CRUD (linked to lead + company + pipeline)
34. Kanban board with drag-and-drop
35. Stage transitions + history + approval flow
36. Won/Lost handling with reason tracking

### Scope 6: Campaign & Meta Integration
37. Campaign CRUD (Campaign Key management)
38. Ad Set + Ad data model + CRUD
39. Meta API client (sync engine for hierarchy + metrics)
40. Lead webhook receiver (auto-create from Meta forms)
41. UTM tracking & attribution mapping
42. Integration Center UI (API keys, test, logs, sync status, channel accounts)
43. Integration health monitoring

### Scope 7: AI Integration
44. OpenAI integration (lead scoring, summarization, qualification)
45. Gemini integration (sentiment, intent, risk, recommendations)
46. AI router + orchestration layer
47. AI triggers on events (configurable, including messaging events)
48. AI insights displayed in timeline
49. AI analysis log viewer
50. AI configuration in Integration Center

### Scope 8: Workflow Automation & Tasks
51. Workflow CRUD (create, clone, test, enable/disable)
52. Automation rules (triggers/conditions/actions — including messaging triggers)
53. Branching logic + delays + fallback actions
54. Workflow execution logging + monitoring
55. Task center (CRUD, types, checklist, attachments)
56. Task views (my tasks, calendar, kanban, overdue)
57. Task snooze + reassign + bulk update
58. Notification center (all event types)
59. Reminder engine (immediate/scheduled/repeated/escalation)

### Scope 9: Dashboards, KPIs & Analytics
60. KPI Builder admin UI (create/edit/remove KPIs, including messaging KPIs)
61. KPI calculation engine (dynamic formula evaluation)
62. KPI snapshot tracking (time-series storage)
63. Executive Dashboard (management)
64. Media Buying Dashboard
65. Sales Dashboard
66. Unified Smarketing Dashboard
67. Dashboard widget configurability
68. Audit log viewer
69. Data export (CSV/Excel)

### Scope 10: Omnichannel Messaging
70. Unified Inbox (all channels in one view, filters, search, status)
71. Conversation management (create, assign, tag, close, reopen)
72. Conversation-to-CRM linking (lead/contact/company/opportunity)
73. WhatsApp integration (inbound/outbound, templates, media)
74. Facebook Messenger integration (page inbox, sync)
75. Instagram DM integration (business messaging, sync)
76. Agent Messaging Workspace (reply, templates, internal notes, context panel)
77. Conversation Router (round robin, team queue, campaign-based, VIP)
78. Messaging SLA Engine (first response, resolution, per-channel SLA)
79. Templates & Saved Replies (variables, folders, approval)
80. AI-Assisted Messaging (summary, intent, sentiment, reply suggestions)
81. Messaging Timeline Sync (all conversation events in customer timeline)
82. Customer Profile Messaging Tab (thread history, quick actions)
83. Conversation tags & classification (priority, disposition, flags)
84. Media & attachment handling (preview, download, link to timeline)
85. Messaging Dashboard (conversations, SLA, channel performance, conversion)
86. Channel-to-revenue reporting (conversation → lead → paid tracking)

### Scope 11: AI Continuity & Bot Automation
87. Agent availability detection (busy/absent/offline/overloaded/out-of-hours)
88. AI Coverage Mode controller (Assist, Auto-Reply, Continuity, Hybrid)
89. Bot Persona Manager (tone, language, style, experience level config from UI)
90. Knowledge Scope Manager (approved sources, restricted topics, compliance rules)
91. Conversation Guardrails engine (prohibited behaviors, escalation triggers)
92. AI Welcome Flow builder (greeting → qualification → routing)
93. AI Follow-Up Sequence builder (10 types: no-response, post-demo, signup, payment, etc.)
94. Bot Flow Builder UI (trigger → conditions → AI generation → wait → branch → escalate)
95. Human Handoff Controller (auto/manual/keyword/stage/confidence/sentiment triggers)
96. Handoff Summary Package (AI generates context summary for incoming agent)
97. AI Task & Reminder auto-creation (follow-up, callback, check-in)
98. AI Continuity Timeline logging (all bot actions visible in timeline)
99. AI Continuity Dashboard & KPIs (coverage rate, handoff rate, SLA saved, conversion)
100. Bot message rate limiting & customer opt-out handling
101. AI A/B testing framework (test message variants, track conversion)
102. Agent feedback loop (rate AI quality, train improvement)
103. AI Communication Governance (staged rollout, approval rules, channel/stage restrictions)

---

## 📁 Updated File Structure

```
crm-smarketing/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── messages/
│   ├── en.json
│   └── ar.json
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── globals.css
│   │   ├── login/page.js
│   │   ├── dashboard/
│   │   │   ├── page.js              # Executive
│   │   │   ├── media/page.js        # Media Buying
│   │   │   ├── sales/page.js        # Sales
│   │   │   ├── smarketing/page.js   # Unified
│   │   │   └── messaging/page.js    # Messaging Dashboard
│   │   ├── leads/
│   │   ├── contacts/
│   │   ├── companies/
│   │   ├── opportunities/
│   │   ├── pipeline/page.js
│   │   ├── tasks/page.js
│   │   ├── inbox/                    # Unified Inbox
│   │   │   ├── page.js              # Inbox list view
│   │   │   └── [id]/page.js         # Conversation view
│   │   ├── campaigns/
│   │   ├── workflows/
│   │   ├── settings/
│   │   │   ├── page.js
│   │   │   ├── integrations/page.js  # Integration Center
│   │   │   ├── channels/page.js     # Channel Accounts Setup
│   │   │   ├── templates/page.js    # Message Templates
│   │   │   ├── routing/page.js      # Routing Rules Config
│   │   │   ├── users/page.js
│   │   │   ├── fields/page.js
│   │   │   ├── scoring/page.js
│   │   │   ├── kpis/page.js
│   │   │   ├── funnel/page.js
│   │   │   ├── pipelines/page.js
│   │   │   ├── workflows/page.js
│   │   │   ├── notifications/page.js
│   │   │   └── audit/page.js
│   │   └── api/
│   │       ├── auth/
│   │       ├── leads/
│   │       ├── contacts/
│   │       ├── companies/
│   │       ├── opportunities/
│   │       ├── campaigns/
│   │       ├── workflows/
│   │       ├── tasks/
│   │       ├── meta/
│   │       ├── ai/
│   │       ├── scoring/
│   │       ├── kpis/
│   │       ├── funnel/
│   │       ├── conversations/        # Messaging API
│   │       ├── messages/             # Message send/receive
│   │       ├── channels/             # Channel management
│   │       ├── templates/            # Message templates
│   │       ├── analytics/
│   │       ├── notifications/
│   │       ├── integrations/
│   │       ├── audit/
│   │       └── settings/
│   ├── components/
│   │   ├── layout/ (Sidebar, Header, AppShell, RoleGuard, LanguageSwitcher)
│   │   ├── ui/ (Button, Card, KPICard, Modal, Table, Badge, Input, etc.)
│   │   ├── leads/
│   │   ├── contacts/
│   │   ├── companies/
│   │   ├── opportunities/
│   │   ├── timeline/
│   │   ├── scoring/ (ScoreBadge, ScoreBreakdown, ScoreHistory, ScoreDistribution)
│   │   ├── kpi/ (KPIBuilder, KPICard, KPIChart)
│   │   ├── dashboard/
│   │   ├── pipeline/ (KanbanBoard, KanbanColumn, KanbanCard)
│   │   ├── workflows/ (WorkflowBuilder, StageEditor, BranchNode, DelayNode)
│   │   ├── campaigns/
│   │   ├── inbox/ (InboxList, ConversationThread, MessageBubble, AgentWorkspace,
│   │   │          QuickReply, TemplateSelector, ConversationSidebar, ChannelBadge)
│   │   ├── bot/ (PersonaEditor, FlowBuilder, FlowStepNode, WelcomeFlowConfig,
│   │   │         FollowUpSequenceConfig, GuardrailsEditor, KnowledgeScopeManager,
│   │   │         HandoffSummary, BotCoverageIndicator, ABTestManager)
│   │   ├── tasks/ (TaskList, TaskCalendar, TaskKanban, TaskForm)
│   │   ├── notifications/ (NotificationCenter, ReminderConfig)
│   │   └── integrations/ (IntegrationCard, IntegrationSetup, IntegrationLogs,
│   │                       ChannelAccountSetup)
│   ├── lib/
│   │   ├── prisma.js
│   │   ├── meta-api.js
│   │   ├── meta-capi.js
│   │   ├── messaging-router.js      # Conversation routing engine
│   │   ├── messaging-sla.js         # Messaging SLA engine
│   │   ├── whatsapp-api.js          # WhatsApp Business API client
│   │   ├── messenger-api.js         # Facebook Messenger API client
│   │   ├── instagram-api.js         # Instagram Messaging API client
│   │   ├── ai-openai.js
│   │   ├── ai-gemini.js
│   │   ├── ai-router.js
│   │   ├── ai-continuity-engine.js   # Bot coverage & automation
│   │   ├── ai-persona-engine.js      # Bot persona prompt builder
│   │   ├── ai-handoff-engine.js      # Human handoff controller
│   │   ├── ai-knowledge-scope.js     # Knowledge boundary enforcement
│   │   ├── scoring-engine.js
│   │   ├── kpi-engine.js
│   │   ├── workflow-engine.js
│   │   ├── reminder-engine.js
│   │   ├── auth.js
│   │   ├── i18n.js
│   │   ├── audit.js
│   │   ├── utils.js
│   │   └── constants.js
│   └── hooks/
├── package.json
├── next.config.js
├── i18n.config.js
└── .env.local
```

---

## 🔧 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/crm_smarketing

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# All API keys configurable via Settings > Integration Center UI
# Defaults can be set in .env but UI overrides take priority

# App
APP_NAME=Smarketing CRM
APP_URL=http://localhost:3000
DEFAULT_CURRENCY=EGP
DEFAULT_TIMEZONE=Africa/Cairo
DEFAULT_LANGUAGE=ar
```

---

## Verification Plan

### Per Scope
- `npm run build` — no compilation errors
- `npm run dev` — all pages load correctly
- Browser testing — navigate all modules

### End-to-End
- Full funnel flow: Lead → MQL → SQL → Demo → Signup → Activation → Paid
- All 6 dashboards with sample data (Exec, Media, Sales, Smarketing, Messaging, AI Continuity)
- Bilingual switching (AR ↔ EN)
- 10-role access testing
- Scoring system validation
- KPI calculation accuracy
- Workflow automation testing (including messaging triggers)
- Task + reminder flow
- Integration connection testing
- Unified Inbox: send/receive test messages
- Conversation-to-lead conversion flow
- Messaging SLA countdown verification
- AI reply suggestion accuracy
- Channel-to-revenue tracking validation
- **AI Continuity**: Agent goes offline → bot takes over → handoff when agent returns
- **Bot Persona**: Configure persona → verify tone/style in generated messages
- **Welcome Flow**: New lead arrives after hours → bot greets + qualifies → creates task
- **Follow-Up Sequence**: No-response for 24h → bot sends follow-up → stops when customer replies
- **Guardrails**: Bot refuses to discuss pricing beyond script → escalates to human
- **Handoff**: Bot generates summary package → agent sees context before replying

---

## Summary of All Modules

| # | Module | Scope | Key Feature |
|---|--------|-------|-------------|
| 1 | Auth & Users | S1 | 10 roles, RBAC, bilingual |
| 2 | Core CRM | S2 | Lead/Contact/Company, dynamic fields |
| 3 | Profile & Timeline | S3 | Timeline, activities, notes, call logs, messaging tab |
| 4 | Client Scoring | S4 | Rule-based + AI, negative scores, messaging scoring |
| 5 | Pipeline & Opportunities | S5 | Dynamic stages, kanban, approval, checklists |
| 6 | Campaign & Meta | S6 | Meta API sync, Integration Center |
| 7 | AI Integration | S7 | GPT + Gemini, 13+ capabilities, orchestration |
| 8 | Workflows & Automation | S8 | Branching, delays, fallback, messaging triggers |
| 9 | Task Center | S8 | 7 task types, calendar, kanban, snooze, bulk |
| 10 | Notifications & Reminders | S8 | 4 reminder types, escalation, per-stage config |
| 11 | KPI Builder | S9 | Dynamic formulas, targets, thresholds, dashboards |
| 12 | Dashboards & Analytics | S9 | 6 dashboards, audit, export |
| 13 | Unified Inbox | S10 | Omnichannel inbox, conversation management |
| 14 | Agent Messaging Workspace | S10 | Reply, templates, internal notes, context panel |
| 15 | Conversation Router | S10 | Round robin, team queue, VIP, campaign-based |
| 16 | Messaging SLA Engine | S10 | Per-channel SLA, countdown, breach alerts |
| 17 | Templates & Saved Replies | S10 | Variables, folders, channel-specific templates |
| 18 | AI-Assisted Messaging | S10 | 13 AI capabilities, reply suggestions |
| 19 | Messaging Dashboard | S10 | Channel performance, conversation-to-revenue |
| 20 | AI Continuity Engine | S11 | Auto-coverage when agent absent/busy/offline |
| 21 | Bot Persona Manager | S11 | Tone, language, style, experience config from UI |
| 22 | Knowledge Scope Manager | S11 | Approved sources, restricted topics, compliance |
| 23 | Welcome & Follow-Up Flows | S11 | 10 bot flow types, configurable sequences |
| 24 | Human Handoff Controller | S11 | Auto/manual handoff + context summary package |
| 25 | AI Communication Governance | S11 | Guardrails, staged rollout, approval rules |
| 26 | AI Continuity Dashboard | S11 | Bot coverage KPIs, A/B testing, quality scores |

---

## 💬 Omnichannel Messaging Module (Scope 10 Detail)

### Database Tables

```sql
-- ═══════════════════════════════════════
-- OMNICHANNEL MESSAGING
-- ═══════════════════════════════════════

CREATE TABLE channel_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_type VARCHAR(30) NOT NULL, -- whatsapp|messenger|instagram
    external_account_id VARCHAR(255),
    display_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- active|inactive|error
    integration_id UUID REFERENCES integrations(id),
    default_team_id VARCHAR(100),
    default_owner_rule JSONB,
    business_hours_profile JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel VARCHAR(30) NOT NULL,
    channel_account_id UUID REFERENCES channel_accounts(id),
    external_conversation_id VARCHAR(255),
    participant_name VARCHAR(255),
    participant_phone VARCHAR(50),
    participant_email VARCHAR(255),
    participant_handle VARCHAR(255),
    participant_avatar_url TEXT,
    linked_lead_id UUID REFERENCES leads(id),
    linked_contact_id UUID REFERENCES contacts(id),
    linked_company_id UUID REFERENCES companies(id),
    linked_opportunity_id UUID REFERENCES opportunities(id),
    status VARCHAR(30) DEFAULT 'new',
    priority VARCHAR(10) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id),
    team VARCHAR(100),
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    first_response_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    sla_status VARCHAR(20) DEFAULT 'pending',
    sla_first_response_deadline TIMESTAMPTZ,
    sla_resolution_deadline TIMESTAMPTZ,
    ai_summary TEXT,
    ai_sentiment VARCHAR(20),
    ai_intent VARCHAR(100),
    ai_urgency VARCHAR(10),
    -- Bot coverage tracking
    bot_active BOOLEAN DEFAULT false,
    bot_persona_id UUID,
    bot_flow_id UUID,
    bot_handoff_at TIMESTAMPTZ,
    bot_message_count INTEGER DEFAULT 0,
    customer_opted_out_of_bot BOOLEAN DEFAULT false,
    tags TEXT[],
    disposition VARCHAR(50),
    is_spam BOOLEAN DEFAULT false,
    campaign_id UUID REFERENCES campaigns(id),
    campaign_key VARCHAR(100),
    unread_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    external_message_id VARCHAR(255),
    direction VARCHAR(10) NOT NULL,
    sender_type VARCHAR(20) NOT NULL, -- customer|agent|system|ai|bot
    sender_id UUID,
    sender_name VARCHAR(255),
    content_type VARCHAR(20) DEFAULT 'text',
    message_text TEXT,
    attachment_url TEXT,
    attachment_metadata JSONB,
    template_id UUID,
    template_name VARCHAR(100),
    template_variables JSONB,
    delivery_status VARCHAR(20) DEFAULT 'sent',
    read_at TIMESTAMPTZ,
    is_internal_note BOOLEAN DEFAULT false,
    -- Bot metadata
    bot_generated BOOLEAN DEFAULT false,
    bot_persona_id UUID,
    bot_flow_step_id UUID,
    bot_confidence DECIMAL(5,2),
    -- A/B testing
    ab_test_variant VARCHAR(50),
    -- Agent feedback
    agent_quality_rating INTEGER, -- 1-5
    agent_feedback_note TEXT,
    ai_tags TEXT[],
    ai_sentiment VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    category VARCHAR(50),
    folder VARCHAR(100),
    channel VARCHAR(30),
    body TEXT NOT NULL,
    variables TEXT[],
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    visible_to_teams TEXT[],
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Unified Inbox UI

```
┌──────────────────────────────────────────────────────────────────────────┐
│  💬 Unified Inbox                    [🤖 Bot: ON] [🔍 Search] [+ Chat]  │
├────────┬─────────────────────────────────────────────────────────────────┤
│ Filter │  📱 All  │ WhatsApp (12) │ Messenger (5) │ Instagram (3)       │
│        │  📋 New (4) │ 🤖 Bot (3) │ Assigned (8) │ Waiting │ ⚠️ SLA   │
├────────┼─────────────────────────────────────────────────────────────────┤
│        │                                                                │
│ Conv.  │  ┌─────────────────────────────────────────────────────────┐   │
│ List   │  │ 📱 Ahmed El-Sayed              ⏰ SLA: 8 min remaining │   │
│        │  │ "I need pricing for multi-branch"     🔵 Score: 72     │   │
│        │  │ Stage: SQL | Assigned: Sarah          📍 2 min ago     │   │
│        │  └─────────────────────────────────────────────────────────┘   │
│        │  ┌─────────────────────────────────────────────────────────┐   │
│        │  │ 🤖 Nour Trading Co.          🟢 Bot Handling            │   │
│        │  │ "Bot: Welcome! Can I ask about your business?" 📍 1min │   │
│        │  │ Flow: Welcome Bot | Until: Agent Available              │   │
│        │  └─────────────────────────────────────────────────────────┘   │
│        │  ┌─────────────────────────────────────────────────────────┐   │
│        │  │ 📸 @cairo_electronics            ⚠️ SLA Breached       │   │
│        │  │ "Can I get a trial?"                   📍 2 hours ago  │   │
│        │  └─────────────────────────────────────────────────────────┘   │
│        │                                                                │
└────────┴────────────────────────────────────────────────────────────────┘
```

### [Messaging Workflow Triggers, Scoring Rules, KPIs, and Roles — same as v4]

---

## 🤖 AI Continuity & Bot Automation Module (Scope 11 Detail)

### Database Tables

```sql
-- ═══════════════════════════════════════
-- AI CONTINUITY & BOT AUTOMATION
-- ═══════════════════════════════════════

CREATE TABLE agent_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'online',
    -- status: online|busy|away|offline|on_leave|overloaded
    active_conversation_count INTEGER DEFAULT 0,
    max_concurrent_conversations INTEGER DEFAULT 10,
    business_hours_profile JSONB,
    auto_away_after_minutes INTEGER DEFAULT 30,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    status_changed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bot_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- "Sales Assistant", "After-Hours Bot"
    name_ar VARCHAR(100),
    description TEXT,
    
    -- Identity
    bot_display_name VARCHAR(100), -- "Mona from Mofawtar"
    bot_display_name_ar VARCHAR(100),
    bot_role VARCHAR(50), -- sales_assistant|qualifier|onboarding_helper|support|follow_up
    
    -- Tone Configuration
    tone VARCHAR(30) DEFAULT 'professional',
    -- tones: formal|semi_formal|friendly|consultative|professional|
    --        persuasive|concise|premium|reassuring|urgent_support|onboarding_helper
    formality_level INTEGER DEFAULT 3, -- 1(very casual) to 5(very formal)
    friendliness_level INTEGER DEFAULT 3, -- 1(reserved) to 5(very warm)
    brevity_level INTEGER DEFAULT 3, -- 1(detailed) to 5(very brief)
    
    -- Language Configuration
    primary_language VARCHAR(5) DEFAULT 'ar', -- ar|en
    fallback_language VARCHAR(5) DEFAULT 'en',
    dialect_style VARCHAR(50) DEFAULT 'egyptian_business',
    -- styles: egyptian_business|modern_standard_arabic|simple_arabic_sme|
    --         english_professional_saas|mixed_ar_en|short_chat|conversational
    allow_code_switching BOOLEAN DEFAULT false, -- mix ar/en
    emoji_usage VARCHAR(20) DEFAULT 'minimal', -- none|minimal|moderate|expressive
    message_length_preference VARCHAR(20) DEFAULT 'moderate', -- short|moderate|detailed
    
    -- Experience Level
    experience_mode VARCHAR(30) DEFAULT 'trained_coordinator',
    -- modes: junior_assistant|trained_coordinator|expert_advisor|
    --        onboarding_specialist|billing_agent|customer_success|escalation_assistant
    
    -- Sales Behavior
    sales_style VARCHAR(30) DEFAULT 'consultative', -- consultative|direct|soft|educational
    objection_handling VARCHAR(20) DEFAULT 'escalate', -- handle|escalate|acknowledge
    can_discuss_pricing BOOLEAN DEFAULT false,
    can_offer_discounts BOOLEAN DEFAULT false,
    can_book_demos BOOLEAN DEFAULT true,
    can_guide_onboarding BOOLEAN DEFAULT true,
    
    -- Knowledge Boundaries
    knowledge_sources TEXT[], -- ['product_kb', 'pricing_basic', 'faq', 'onboarding']
    restricted_topics TEXT[], -- ['legal', 'compliance', 'advanced_pricing', 'contracts']
    
    -- Communication Guardrails
    prohibited_behaviors TEXT[],
    -- ['promise_unsupported_features', 'confirm_unauthorized_discounts',
    --  'finalize_legal_commitments', 'argue_aggressively',
    --  'continue_after_human_request', 'share_internal_info']
    max_messages_before_handoff INTEGER DEFAULT 10,
    max_conversation_duration_minutes INTEGER DEFAULT 60,
    confidence_threshold DECIMAL(5,2) DEFAULT 0.70,
    
    -- Brand Rules
    brand_guidelines TEXT,
    approved_promises TEXT[],
    custom_instructions TEXT, -- freeform system prompt additions
    
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bot_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    description TEXT,
    flow_type VARCHAR(30) NOT NULL,
    -- types: welcome|qualification|after_hours|busy_agent|no_response_followup|
    --        demo_reminder|signup_completion|activation_assistant|
    --        payment_reminder|reactivation
    persona_id UUID REFERENCES bot_personas(id),
    
    -- Scope
    applies_to_channels TEXT[] DEFAULT '{"all"}',
    applies_to_pipelines TEXT[],
    applies_to_stages TEXT[],
    
    -- Trigger Configuration
    trigger_type VARCHAR(50) NOT NULL,
    -- triggers: new_conversation|agent_unavailable|sla_breach|no_response|
    --           stage_entered|event_occurred|scheduled|manual
    trigger_conditions JSONB DEFAULT '{}',
    trigger_delay_minutes INTEGER DEFAULT 0,
    
    -- Stop Conditions
    stop_conditions JSONB DEFAULT '[]',
    -- [{"type": "customer_replied"}, {"type": "stage_changed"},
    --  {"type": "payment_completed"}, {"type": "human_resumed"},
    --  {"type": "customer_optout"}, {"type": "max_messages_reached"}]
    max_messages INTEGER DEFAULT 5,
    max_duration_hours INTEGER DEFAULT 72,
    
    -- Escalation
    escalation_rules JSONB DEFAULT '{}',
    fallback_action VARCHAR(50) DEFAULT 'escalate_to_manager',
    
    -- Human approval
    requires_approval BOOLEAN DEFAULT false,
    approval_timeout_minutes INTEGER DEFAULT 5,
    
    -- A/B Testing
    ab_test_enabled BOOLEAN DEFAULT false,
    ab_test_variants JSONB, -- [{"name": "A", "weight": 50}, {"name": "B", "weight": 50}]
    
    -- Rate Limiting
    rate_limit_per_conversation INTEGER DEFAULT 5, -- max msgs per conversation per hour
    rate_limit_per_channel INTEGER DEFAULT 100, -- max msgs per channel per hour
    
    is_active BOOLEAN DEFAULT true,
    is_testable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bot_flow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID REFERENCES bot_flows(id) ON DELETE CASCADE,
    step_type VARCHAR(30) NOT NULL,
    -- types: send_template|ai_generate|wait|decision_branch|collect_input|
    --        create_task|update_field|move_stage|escalate|notify|
    --        create_timeline_event|check_condition|end
    position INTEGER NOT NULL,
    
    -- Content
    template_id UUID, -- if send_template
    ai_prompt_template TEXT, -- if ai_generate
    ai_provider VARCHAR(20), -- openai|gemini
    
    -- Wait / Delay
    wait_minutes INTEGER, -- if wait step
    wait_until_condition JSONB, -- if conditional wait
    
    -- Branch
    branch_conditions JSONB, -- if decision_branch
    branch_true_step_id UUID, -- go to if true
    branch_false_step_id UUID, -- go to if false
    
    -- Action params
    action_params JSONB DEFAULT '{}',
    
    -- AB Testing variant
    ab_variant VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    bot_persona_id UUID REFERENCES bot_personas(id),
    bot_flow_id UUID REFERENCES bot_flows(id),
    
    -- Coverage context
    coverage_reason VARCHAR(30) NOT NULL,
    -- reasons: agent_busy|agent_absent|agent_offline|after_hours|
    --          unassigned|sla_breach|overloaded|manual_activation
    original_agent_id UUID REFERENCES users(id),
    
    -- Session lifecycle
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    end_reason VARCHAR(30),
    -- reasons: agent_returned|customer_opted_out|handoff_triggered|
    --          max_messages|max_duration|escalated|stop_condition_met|
    --          conversation_closed|error
    
    -- Stats
    bot_messages_sent INTEGER DEFAULT 0,
    customer_messages_received INTEGER DEFAULT 0,
    data_collected JSONB DEFAULT '{}',
    tasks_created INTEGER DEFAULT 0,
    
    -- Handoff
    handoff_to UUID REFERENCES users(id),
    handoff_summary TEXT,
    handoff_customer_intent TEXT,
    handoff_objections TEXT[],
    handoff_pending_questions TEXT[],
    handoff_promised_followup TEXT,
    handoff_recommended_action TEXT,
    handoff_urgency VARCHAR(10),
    
    -- Quality
    agent_satisfaction_rating INTEGER, -- 1-5 agent rates bot quality
    agent_feedback TEXT,
    customer_satisfaction_rating INTEGER, -- if collected
    
    -- AB Testing
    ab_test_variant VARCHAR(50),
    conversion_outcome VARCHAR(20), -- qualified|unqualified|lost|converted
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### AI Coverage Modes

| Mode | AI Sends Messages? | Human Approves? | Use Case |
|------|-------------------|----------------|----------|
| **Assist** | ❌ No — drafts only | Agent sends | Agent is active, AI helps |
| **Auto-Reply** | ✅ Pre-approved categories | No (pre-approved) | Welcome, acknowledgment, FAQ |
| **Continuity** | ✅ Dynamic within limits | Optional | Agent absent/busy, AI covers |
| **Hybrid** | ✅ Low-risk auto / ⚠️ High-risk escalate | High-risk only | Default production mode |

### Agent Availability Detection

```mermaid
flowchart TB
    MSG["New Inbound Message"] --> CHECK{"Agent Available?"}
    CHECK --> |"Online + < Max Load"| HUMAN["Route to Agent"]
    CHECK --> |"Busy/Away/Offline"| BOT_CHECK{"Bot Enabled for Stage/Channel?"}
    BOT_CHECK --> |"No"| QUEUE["Queue + Notify Manager"]
    BOT_CHECK --> |"Yes"| RISK{"Risk Level?"}
    RISK --> |"Low"| AUTO["Bot: Auto-Reply Mode"]
    RISK --> |"Medium"| CONT["Bot: Continuity Mode"]
    RISK --> |"High"| HYBRID["Bot: Acknowledge + Escalate"]
    AUTO --> LOG["Log in Timeline"]
    CONT --> LOG
    HYBRID --> LOG
    LOG --> TASK["Create Agent Task"]
    TASK --> MONITOR["Monitor for Handoff Trigger"]
    MONITOR --> |"Agent Returns"| HANDOFF["Generate Handoff Summary"]
    MONITOR --> |"Escalation Needed"| ESCALATE["Escalate to Manager"]
```

### 10 Bot Flow Types

| # | Flow | Trigger | Actions | Stop When |
|---|------|---------|---------|----------|
| 1 | **Welcome Bot** | New conversation | Greet → Identify intent → Qualify → Route | Agent available |
| 2 | **First Qualification Bot** | Lead created | Ask business type → Branches → Size → Need | Qualified or unqualified |
| 3 | **After-Hours Bot** | Outside business hours | Acknowledge → Collect info → Promise follow-up | Business hours resume |
| 4 | **Busy-Agent Bot** | Agent overloaded | Acknowledge → Keep warm → Schedule callback | Agent freed up |
| 5 | **No-Response Follow-Up** | Customer silent 24h+ | Nudge → Check interest → Final attempt | Customer replies or 3 attempts |
| 6 | **Demo Reminder Bot** | Demo scheduled | Confirm → Remind 24h → Remind 1h | Demo completed |
| 7 | **Signup Completion Bot** | Signup started incomplete | Guide → Assist → Escalate blocker | Signup completed |
| 8 | **Activation Assistant** | Signup completed | Guide onboarding → Check progress → Help | Activation completed |
| 9 | **Payment Reminder Bot** | Trial ending / Invoice due | Remind → Value prop → Urgency → Escalate | Payment received |
| 10 | **Reactivation Bot** | Lost lead 30+ days | Re-engage → New offer → Check interest | Customer responds or 3 attempts |

### Bot Persona Configuration UI

```
┌──────────────────────────────────────────────────────────────────┐
│  🤖 Bot Persona: Sales Assistant                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📝 IDENTITY                                                     │
│  Name:         [مونة من مفوتر        ]                           │
│  Role:         [Trained Sales Coordinator  ▼]                    │
│                                                                  │
│  🗣️ TONE & STYLE                                                 │
│  Tone:         [Professional           ▼]                        │
│  Formality:    [███████░░░] 3/5                                   │
│  Friendliness: [████████░░] 4/5                                   │
│  Brevity:      [██████░░░░] 3/5                                   │
│  Sales Style:  [Consultative           ▼]                        │
│                                                                  │
│  🌍 LANGUAGE                                                     │
│  Primary:      [Arabic                 ▼]                        │
│  Fallback:     [English                ▼]                        │
│  Dialect:      [Egyptian Business      ▼]                        │
│  Code Switch:  [✗] Allow Arabic-English mixing                   │
│  Emoji:        [Minimal                ▼]                        │
│  Msg Length:   [Moderate               ▼]                        │
│                                                                  │
│  📚 KNOWLEDGE & BOUNDARIES                                       │
│  Sources:      [✓] Product KB  [✓] FAQ  [✓] Onboarding          │
│                [✗] Pricing Details  [✗] Legal                    │
│  Can discuss pricing:      [✗]                                   │
│  Can offer discounts:      [✗]                                   │
│  Can book demos:           [✓]                                   │
│  Can guide onboarding:     [✓]                                   │
│  Objection handling:       [Escalate           ▼]                │
│                                                                  │
│  🛑 GUARDRAILS                                                   │
│  Max messages before handoff:  [10    ]                          │
│  Max conversation duration:    [60 min]                          │
│  Confidence threshold:         [70%   ]                          │
│  Prohibited:   [✓] Promise features [✓] Confirm discounts       │
│                [✓] Legal commitments [✓] Share internal info     │
│                [✓] Continue after human request                   │
│                                                                  │
│  [Preview Bot Response]  [Save]  [Set as Default]                │
└──────────────────────────────────────────────────────────────────┘
```

### Human Handoff Package

When AI hands off to the agent, the system generates:

```
┌──────────────────────────────────────────────────────────────────┐
│  🔄 Bot Handoff Summary                         📋 Copy All     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 Summary: Customer is a 3-branch retail business in Cairo     │
│  interested in e-invoice integration. Asked about pricing and    │
│  multi-branch support. Seems ready for demo.                     │
│                                                                  │
│  🎯 Intent: High purchase intent - multi-branch setup            │
│  😊 Sentiment: Positive (0.82)                                   │
│  ⚡ Urgency: Medium — wants setup before tax season               │
│                                                                  │
│  ❓ Pending Questions:                                            │
│  - "Can you integrate with my current POS?"                      │
│  - "What's the pricing for 3 branches?"                          │
│                                                                  │
│  🚫 Objections: None detected                                    │
│                                                                  │
│  📌 Promised: Follow-up call from specialist today                │
│                                                                  │
│  ✅ Recommended: Schedule demo + send multi-branch pricing PDF    │
│                                                                  │
│  🤖 Bot sent 4 messages over 12 minutes                          │
│  📋 Data collected: business_type=retail, branches=3, city=Cairo  │
│  ✅ Task created: "Follow up - Ahmed El-Sayed" (due: today)       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### AI Continuity KPIs

| KPI | Formula | Dashboard |
|-----|---------|----------|
| AI-Handled Conversations | COUNT(sessions) | AI Continuity |
| AI Coverage Rate | ai_handled / total_outside_hours | AI Continuity, Exec |
| AI-to-Human Handoff Rate | handoffs / ai_sessions | AI Continuity |
| SLA Saved by AI | sla_would_breach - sla_breached | AI Continuity, Exec |
| Response Time Improvement | avg_time_with_ai vs without | AI Continuity |
| Welcome-to-Qualified Rate | qualified / ai_welcomed | AI Continuity |
| Follow-Up Completion Rate | completed / total_followups | AI Continuity |
| AI-Generated Tasks | COUNT(tasks WHERE source=bot) | AI Continuity |
| Agent Quality Rating (Avg) | AVG(agent_satisfaction_rating) | AI Continuity |
| AI vs Human Conversion | ai_conversion % vs human_conversion % | Smarketing |

### 🆕 My Additions (Not in your addendum)

> [!TIP]
> These are features I recommend adding based on production experience with AI-powered CRMs:

| Feature | Description | Why |
|---------|-------------|-----|
| **Customer Bot Opt-Out** | Customer can type "talk to human" at any time → instant handoff | Customer trust & compliance |
| **Bot Message Rate Limiting** | Max N messages per conversation per hour, max N per channel per hour | Prevent spam, protect API costs |
| **AI A/B Testing** | Test different message variants per bot flow → track which converts better | Data-driven optimization |
| **Agent Feedback Loop** | Agent rates each AI session 1-5 + optional note → used to improve prompts | Continuous quality improvement |
| **Conversation Quality Score** | Auto-score each AI conversation based on: customer replies, sentiment trend, data collected, outcome | Monitor AI effectiveness |
