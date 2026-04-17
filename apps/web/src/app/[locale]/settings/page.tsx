"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListAuditLogsQueryKey,
  getListBotFlowsQueryKey,
  getListChannelAccountsQueryKey,
  getListCustomFieldsQueryKey,
  getListFunnelStagesQueryKey,
  getListIntegrationsQueryKey,
  getListKpiDefinitionsQueryKey,
  getListPipelinesQueryKey,
  getListScoringModelsQueryKey,
  getListSettingsQueryKey,
  getListUsersQueryKey,
  useCreateCustomField,
  useDeleteCustomField,
  useListAuditLogs,
  useListBotFlows,
  useListChannelAccounts,
  useListCustomFields,
  useListFunnelStages,
  useListIntegrations,
  useListKpiDefinitions,
  useListPipelines,
  useListScoringModels,
  useListSettings,
  useListUsers,
} from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionCard, StatCard } from "@/components/crm/blocks";
import { ScoringAdmin } from "@/components/crm/scoring-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [fieldForm, setFieldForm] = useState({
    entityType: "lead",
    fieldName: "",
    fieldLabelEn: "",
    fieldLabelAr: "",
    fieldType: "text",
    isRequired: false,
    fieldGroup: "general",
  });
  const { data: users } = useListUsers(undefined, { query: { queryKey: getListUsersQueryKey() } });
  const { data: kpis } = useListKpiDefinitions({ query: { queryKey: getListKpiDefinitionsQueryKey() } });
  const { data: stages } = useListFunnelStages({ query: { queryKey: getListFunnelStagesQueryKey() } });
  const { data: pipelines } = useListPipelines({ query: { queryKey: getListPipelinesQueryKey() } });
  const { data: scoring } = useListScoringModels({ query: { queryKey: getListScoringModelsQueryKey() } });
  const { data: integrations } = useListIntegrations({ query: { queryKey: getListIntegrationsQueryKey() } });
  const { data: fields } = useListCustomFields(undefined, { query: { queryKey: getListCustomFieldsQueryKey() } });
  const { data: channels } = useListChannelAccounts({ query: { queryKey: getListChannelAccountsQueryKey() } });
  const { data: botFlows } = useListBotFlows({ query: { queryKey: getListBotFlowsQueryKey() } });
  const { data: settings } = useListSettings({ query: { queryKey: getListSettingsQueryKey() } });
  const { data: auditLogs } = useListAuditLogs(undefined, { query: { queryKey: getListAuditLogsQueryKey() } });
  const createField = useCreateCustomField();
  const deleteField = useDeleteCustomField();

  async function handleCreateField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createField.mutateAsync({ data: fieldForm });
    await queryClient.invalidateQueries({ queryKey: getListCustomFieldsQueryKey() });
    setFieldForm({
      entityType: fieldForm.entityType,
      fieldName: "",
      fieldLabelEn: "",
      fieldLabelAr: "",
      fieldType: "text",
      isRequired: false,
      fieldGroup: "general",
    });
  }

  async function handleDeleteField(id: string) {
    await deleteField.mutateAsync({ id });
    await queryClient.invalidateQueries({ queryKey: getListCustomFieldsQueryKey() });
  }

  return (
    <AppShell description="Dynamic configuration center for users, KPI builder, funnels, scoring, integrations, channels, and AI continuity controls." title="Settings">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Users" value={users?.length ?? 0} />
        <StatCard label="KPIs" value={kpis?.length ?? 0} />
        <StatCard label="Funnel stages" value={stages?.length ?? 0} />
        <StatCard label="Integrations" value={integrations?.length ?? 0} />
        <StatCard label="Custom fields" value={fields?.length ?? 0} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SectionCard description="Zero-code admin surfaces called out directly in the implementation plan." title="Configuration modules">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Pipelines", pipelines?.length ?? 0],
              ["Scoring models", scoring?.length ?? 0],
              ["Channel accounts", channels?.length ?? 0],
              ["Bot flows", botFlows?.length ?? 0],
              ["System settings", settings?.length ?? 0],
              ["Pinned KPIs", kpis?.filter((item) => item.isPinned).length ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] bg-white/70 px-4 py-4">
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard description="Live system key-value settings pulled from the configuration store." title="Current settings">
          <div className="space-y-3">
            {settings?.map((item) => (
              <div key={item.key} className="rounded-[1.5rem] bg-white/70 px-4 py-4">
                <p className="font-semibold">{item.key}</p>
                <p className="mt-2 text-sm text-muted">{JSON.stringify(item.value)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard description="Scope 2 field builder for leads, contacts, and companies." title="Dynamic field builder">
          <form className="grid gap-3" onSubmit={handleCreateField}>
            <label className="space-y-2">
              <span className="text-sm font-medium">Entity type</span>
              <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={fieldForm.entityType} onChange={(event) => setFieldForm((current) => ({ ...current, entityType: event.target.value }))}>
                <option value="lead">Lead</option>
                <option value="contact">Contact</option>
                <option value="company">Company</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Field key</span>
              <Input value={fieldForm.fieldName} onChange={(event) => setFieldForm((current) => ({ ...current, fieldName: event.target.value }))} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">English label</span>
              <Input value={fieldForm.fieldLabelEn} onChange={(event) => setFieldForm((current) => ({ ...current, fieldLabelEn: event.target.value }))} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Arabic label</span>
              <Input value={fieldForm.fieldLabelAr} onChange={(event) => setFieldForm((current) => ({ ...current, fieldLabelAr: event.target.value }))} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Field type</span>
              <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={fieldForm.fieldType} onChange={(event) => setFieldForm((current) => ({ ...current, fieldType: event.target.value }))}>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="date">Date</option>
                <option value="textarea">Textarea</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Group</span>
              <Input value={fieldForm.fieldGroup} onChange={(event) => setFieldForm((current) => ({ ...current, fieldGroup: event.target.value }))} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input checked={fieldForm.isRequired} onChange={(event) => setFieldForm((current) => ({ ...current, isRequired: event.target.checked }))} type="checkbox" />
              Required field
            </label>
            <Button disabled={createField.isPending} type="submit">
              {createField.isPending ? "Adding..." : "Add custom field"}
            </Button>
          </form>
        </SectionCard>

        <SectionCard description="Current dynamic fields and recent admin actions." title="Field inventory and audit">
          <div className="space-y-3">
            {fields?.map((field) => (
              <div key={field.id} className="flex flex-col gap-3 rounded-[1.5rem] bg-white/70 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{field.fieldLabelEn ?? field.fieldName}</p>
                  <p className="mt-1 text-sm text-muted">
                    {field.entityType} • {field.fieldType} • position {field.position}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteField(field.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold">Recent audit trail</p>
            {auditLogs?.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-[1.5rem] bg-white/70 px-4 py-3 text-sm">
                <p className="font-medium">{item.action}</p>
                <p className="mt-1 text-muted">{item.entityType ?? "system"} • {item.entityId ?? "n/a"}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <ScoringAdmin />
    </AppShell>
  );
}
