"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetScoringModelQueryKey,
  getListScoringModelsQueryKey,
  useCreateScoringModel,
  useCreateScoringRule,
  useDeleteScoringModel,
  useDeleteScoringRule,
  useGetScoringModel,
  useListScoringModels,
  useUpdateScoringModel,
  useUpdateScoringRule,
  type ScoringRule,
} from "@workspace/api-client-react";
import { SectionCard, StatCard } from "@/components/crm/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RULE_CATEGORIES = [
  "profile",
  "qualification",
  "engagement",
  "messaging",
  "source",
  "behavior",
  "negative_signal",
];

export function ScoringAdmin() {
  const queryClient = useQueryClient();
  const { data: models } = useListScoringModels({
    query: { queryKey: getListScoringModelsQueryKey() },
  });
  const [selectedModelId, setSelectedModelId] = useState("");
  const [modelForm, setModelForm] = useState({
    name: "",
    nameAr: "",
    description: "",
    entityType: "lead",
    isDefault: false,
    totalWeight: "100",
  });
  const [ruleForm, setRuleForm] = useState({
    category: "profile",
    ruleName: "",
    ruleNameAr: "",
    description: "",
    scoreValue: "10",
    weight: "1",
    isNegative: false,
    position: "0",
  });
  const [previewState, setPreviewState] = useState<Record<string, boolean>>({});

  const createModel = useCreateScoringModel();
  const updateModel = useUpdateScoringModel();
  const deleteModel = useDeleteScoringModel();
  const createRule = useCreateScoringRule();
  const updateRule = useUpdateScoringRule();
  const deleteRule = useDeleteScoringRule();

  const { data: selectedModel } = useGetScoringModel(selectedModelId, {
    query: { queryKey: getGetScoringModelQueryKey(selectedModelId), enabled: Boolean(selectedModelId) },
  });

  useEffect(() => {
    if (!selectedModelId && models?.length) {
      setSelectedModelId(models[0].id);
    }
  }, [models, selectedModelId]);

  useEffect(() => {
    if (!selectedModel) return;
    setPreviewState(
      Object.fromEntries(selectedModel.rules.map((rule) => [rule.id, !rule.isNegative])),
    );
  }, [selectedModel]);

  const previewRules = useMemo(
    () => selectedModel?.rules.filter((rule) => previewState[rule.id]) ?? [],
    [previewState, selectedModel],
  );
  const previewPositive = previewRules
    .filter((rule) => !rule.isNegative)
    .reduce((sum, rule) => sum + Number(rule.scoreValue) * Number(rule.weight), 0);
  const previewNegative = previewRules
    .filter((rule) => rule.isNegative)
    .reduce((sum, rule) => sum + Number(rule.scoreValue) * Number(rule.weight), 0);
  const previewScore = previewPositive - previewNegative;

  async function refreshScoring(modelId?: string) {
    await queryClient.invalidateQueries({ queryKey: getListScoringModelsQueryKey() });
    if (modelId) {
      await queryClient.invalidateQueries({ queryKey: getGetScoringModelQueryKey(modelId) });
    }
  }

  async function handleCreateModel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await createModel.mutateAsync({
      data: {
        name: modelForm.name,
        nameAr: toOptionalString(modelForm.nameAr),
        description: toOptionalString(modelForm.description),
        entityType: modelForm.entityType,
        isDefault: modelForm.isDefault,
        totalWeight: Number(modelForm.totalWeight || "100"),
      },
    });
    await refreshScoring(created.id);
    setSelectedModelId(created.id);
    setModelForm({
      name: "",
      nameAr: "",
      description: "",
      entityType: "lead",
      isDefault: false,
      totalWeight: "100",
    });
  }

  async function handleUpdateModel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedModelId) return;
    const formData = new FormData(event.currentTarget);
    await updateModel.mutateAsync({
      id: selectedModelId,
      data: {
        name: toOptionalString(formData.get("name")) ?? selectedModel?.name,
        nameAr: toOptionalString(formData.get("nameAr")),
        description: toOptionalString(formData.get("description")),
        isActive: String(formData.get("isActive")) === "true",
        isDefault: String(formData.get("isDefault")) === "true",
        totalWeight: Number(formData.get("totalWeight") || selectedModel?.totalWeight || 100),
      },
    });
    await refreshScoring(selectedModelId);
  }

  async function handleDeleteModel() {
    if (!selectedModelId) return;
    const modelId = selectedModelId;
    await deleteModel.mutateAsync({ id: modelId });
    await refreshScoring();
    const remaining = (models ?? []).filter((model) => model.id !== modelId);
    setSelectedModelId(remaining[0]?.id ?? "");
  }

  async function handleCreateRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedModelId) return;
    await createRule.mutateAsync({
      id: selectedModelId,
      data: {
        category: ruleForm.category,
        ruleName: ruleForm.ruleName,
        ruleNameAr: toOptionalString(ruleForm.ruleNameAr),
        description: toOptionalString(ruleForm.description),
        scoreValue: Number(ruleForm.scoreValue || "0"),
        weight: Number(ruleForm.weight || "1"),
        isNegative: ruleForm.isNegative,
        position: Number(ruleForm.position || "0"),
      },
    });
    await refreshScoring(selectedModelId);
    setRuleForm({
      category: ruleForm.category,
      ruleName: "",
      ruleNameAr: "",
      description: "",
      scoreValue: "10",
      weight: "1",
      isNegative: false,
      position: String((selectedModel?.rules.length ?? 0) + 1),
    });
  }

  async function handleUpdateRule(event: React.FormEvent<HTMLFormElement>, ruleId: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateRule.mutateAsync({
      id: ruleId,
      data: {
        category: String(formData.get("category") ?? ""),
        ruleName: String(formData.get("ruleName") ?? ""),
        ruleNameAr: toOptionalString(formData.get("ruleNameAr")),
        description: toOptionalString(formData.get("description")),
        scoreValue: Number(formData.get("scoreValue") || "0"),
        weight: Number(formData.get("weight") || "1"),
        isNegative: String(formData.get("isNegative")) === "true",
        isActive: String(formData.get("isActive")) === "true",
        position: Number(formData.get("position") || "0"),
      },
    });
    if (selectedModelId) {
      await refreshScoring(selectedModelId);
    }
  }

  async function handleDeleteRule(ruleId: string) {
    await deleteRule.mutateAsync({ id: ruleId });
    if (selectedModelId) {
      await refreshScoring(selectedModelId);
    }
  }

  return (
    <div className="mt-4 grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          description="Create and activate lead scoring models without code changes."
          title="Scoring models"
        >
          <form className="grid gap-3" onSubmit={handleCreateModel}>
            <label className="space-y-2">
              <span className="text-sm font-medium">Model name</span>
              <Input
                onChange={(event) =>
                  setModelForm((current) => ({ ...current, name: event.target.value }))
                }
                value={modelForm.name}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Arabic name</span>
              <Input
                onChange={(event) =>
                  setModelForm((current) => ({ ...current, nameAr: event.target.value }))
                }
                value={modelForm.nameAr}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Description</span>
              <textarea
                className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                onChange={(event) =>
                  setModelForm((current) => ({ ...current, description: event.target.value }))
                }
                value={modelForm.description}
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Entity type</span>
                <select
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  onChange={(event) =>
                    setModelForm((current) => ({ ...current, entityType: event.target.value }))
                  }
                  value={modelForm.entityType}
                >
                  <option value="lead">Lead</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Total weight</span>
                <Input
                  onChange={(event) =>
                    setModelForm((current) => ({ ...current, totalWeight: event.target.value }))
                  }
                  type="number"
                  value={modelForm.totalWeight}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={modelForm.isDefault}
                onChange={(event) =>
                  setModelForm((current) => ({ ...current, isDefault: event.target.checked }))
                }
                type="checkbox"
              />
              Set as default model
            </label>
            <Button disabled={createModel.isPending || !modelForm.name.trim()} type="submit">
              {createModel.isPending ? "Creating..." : "Create scoring model"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            {(models ?? []).map((model) => {
              const selected = model.id === selectedModelId;
              return (
                <button
                  key={model.id}
                  className={[
                    "w-full rounded-[1.5rem] border px-4 py-4 text-left transition",
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white/70 hover:bg-white",
                  ].join(" ")}
                  onClick={() => setSelectedModelId(model.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{model.name}</p>
                      <p className={selected ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-muted"}>
                        {model.description ?? "No description"}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p>{model.isDefault ? "Default" : "Optional"}</p>
                      <p className={selected ? "mt-1 text-slate-300" : "mt-1 text-muted"}>
                        {model.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard
            description="Edit the active model, manage publish state, and review its weighted score logic."
            title="Selected model"
          >
            {selectedModel ? (
              <form className="grid gap-4" onSubmit={handleUpdateModel}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Name</span>
                    <Input defaultValue={selectedModel.name} name="name" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Arabic name</span>
                    <Input defaultValue={selectedModel.nameAr ?? ""} name="nameAr" />
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Description</span>
                  <textarea
                    className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    defaultValue={selectedModel.description ?? ""}
                    name="description"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Total weight</span>
                    <Input defaultValue={selectedModel.totalWeight} name="totalWeight" type="number" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Active</span>
                    <select
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                      defaultValue={selectedModel.isActive ? "true" : "false"}
                      name="isActive"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Default</span>
                    <select
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                      defaultValue={selectedModel.isDefault ? "true" : "false"}
                      name="isDefault"
                    >
                      <option value="true">Default</option>
                      <option value="false">Optional</option>
                    </select>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={updateModel.isPending} type="submit">
                    {updateModel.isPending ? "Saving..." : "Save model"}
                  </Button>
                  <Button
                    disabled={deleteModel.isPending}
                    onClick={handleDeleteModel}
                    type="button"
                    variant="outline"
                  >
                    Delete model
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-muted">Create or select a scoring model to configure it.</p>
            )}
          </SectionCard>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Rules" value={selectedModel?.rules.length ?? 0} />
            <StatCard
              label="Positive"
              value={selectedModel?.rules.filter((rule) => !rule.isNegative).length ?? 0}
            />
            <StatCard
              label="Negative"
              value={selectedModel?.rules.filter((rule) => rule.isNegative).length ?? 0}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <SectionCard
          description="Define weighted positive and negative scoring logic, including messaging-related signals."
          title="Rules"
        >
          {selectedModel ? (
            <div className="space-y-4">
              <form className="grid gap-3 rounded-[1.5rem] bg-white/70 p-4" onSubmit={handleCreateRule}>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Category</span>
                    <select
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                      onChange={(event) =>
                        setRuleForm((current) => ({ ...current, category: event.target.value }))
                      }
                      value={ruleForm.category}
                    >
                      {RULE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {formatLabel(category)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Score value</span>
                    <Input
                      onChange={(event) =>
                        setRuleForm((current) => ({ ...current, scoreValue: event.target.value }))
                      }
                      type="number"
                      value={ruleForm.scoreValue}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Weight</span>
                    <Input
                      onChange={(event) =>
                        setRuleForm((current) => ({ ...current, weight: event.target.value }))
                      }
                      step="0.1"
                      type="number"
                      value={ruleForm.weight}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Position</span>
                    <Input
                      onChange={(event) =>
                        setRuleForm((current) => ({ ...current, position: event.target.value }))
                      }
                      type="number"
                      value={ruleForm.position}
                    />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Rule name</span>
                    <Input
                      onChange={(event) =>
                        setRuleForm((current) => ({ ...current, ruleName: event.target.value }))
                      }
                      value={ruleForm.ruleName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Arabic rule name</span>
                    <Input
                      onChange={(event) =>
                        setRuleForm((current) => ({ ...current, ruleNameAr: event.target.value }))
                      }
                      value={ruleForm.ruleNameAr}
                    />
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Description</span>
                  <textarea
                    className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    onChange={(event) =>
                      setRuleForm((current) => ({ ...current, description: event.target.value }))
                    }
                    value={ruleForm.description}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={ruleForm.isNegative}
                    onChange={(event) =>
                      setRuleForm((current) => ({ ...current, isNegative: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  Negative scoring rule
                </label>
                <Button disabled={createRule.isPending || !ruleForm.ruleName.trim()} type="submit">
                  {createRule.isPending ? "Adding..." : "Add rule"}
                </Button>
              </form>

              {selectedModel.rules.map((rule) => (
                <RuleEditor
                  key={rule.id}
                  onDelete={handleDeleteRule}
                  onSave={handleUpdateRule}
                  rule={rule}
                  saving={updateRule.isPending}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Select a model to manage its scoring rules.</p>
          )}
        </SectionCard>

        <SectionCard
          description="Test how the current model behaves before using it live."
          title="Preview"
        >
          {selectedModel ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Projected Score" value={previewScore.toFixed(1)} />
                <StatCard label="Positive Weight" value={previewPositive.toFixed(1)} />
                <StatCard label="Negative Weight" value={previewNegative.toFixed(1)} />
              </div>
              <div className="rounded-[1.5rem] bg-white/70 p-4">
                <p className="text-sm font-semibold">Rule preview toggles</p>
                <p className="mt-1 text-sm text-muted">
                  Simulate which rules match to preview the total score before publishing the model.
                </p>
                <div className="mt-4 space-y-3">
                  {selectedModel.rules.map((rule) => (
                    <label
                      key={rule.id}
                      className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{rule.ruleName}</p>
                        <p className="mt-1 text-sm text-muted">
                          {formatLabel(rule.category)} • {rule.isNegative ? "Negative" : "Positive"} • value {Number(rule.scoreValue)} × weight {Number(rule.weight)}
                        </p>
                      </div>
                      <input
                        checked={Boolean(previewState[rule.id])}
                        onChange={(event) =>
                          setPreviewState((current) => ({
                            ...current,
                            [rule.id]: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Select a scoring model to preview its rule impact.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function RuleEditor({
  onDelete,
  onSave,
  rule,
  saving,
}: {
  rule: ScoringRule;
  saving: boolean;
  onSave: (event: React.FormEvent<HTMLFormElement>, ruleId: string) => Promise<void>;
  onDelete: (ruleId: string) => Promise<void>;
}) {
  return (
    <form className="grid gap-3 rounded-[1.5rem] bg-white/70 p-4" onSubmit={(event) => onSave(event, rule.id)}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-medium">Category</span>
          <select
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            defaultValue={rule.category}
            name="category"
          >
            {RULE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {formatLabel(category)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Score value</span>
          <Input defaultValue={rule.scoreValue} name="scoreValue" step="0.1" type="number" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Weight</span>
          <Input defaultValue={rule.weight} name="weight" step="0.1" type="number" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Position</span>
          <Input defaultValue={rule.position} name="position" type="number" />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">Rule name</span>
          <Input defaultValue={rule.ruleName} name="ruleName" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Arabic rule name</span>
          <Input defaultValue={rule.ruleNameAr ?? ""} name="ruleNameAr" />
        </label>
      </div>
      <label className="space-y-2">
        <span className="text-sm font-medium">Description</span>
        <textarea
          className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          defaultValue={rule.description ?? ""}
          name="description"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">Negative rule</span>
          <select
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            defaultValue={rule.isNegative ? "true" : "false"}
            name="isNegative"
          >
            <option value="false">Positive</option>
            <option value="true">Negative</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Active</span>
          <select
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            defaultValue={rule.isActive ? "true" : "false"}
            name="isActive"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={saving} type="submit">
          Save rule
        </Button>
        <Button onClick={() => onDelete(rule.id)} type="button" variant="outline">
          Delete rule
        </Button>
      </div>
    </form>
  );
}

function toOptionalString(value: FormDataEntryValue | string | null) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : undefined;
}

function formatLabel(value: string) {
  return value
    .split(/[_-\s]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
