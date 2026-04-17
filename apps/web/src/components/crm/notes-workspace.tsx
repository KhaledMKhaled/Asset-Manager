"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListNotesQueryKey,
  useCreateNote,
  useUpdateNote,
  type Note,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { EmptyPanel, FeedCard } from "@/components/crm/profile-tabs";

const NOTE_TYPE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "qualification", label: "Qualification" },
  { value: "objection", label: "Objection" },
  { value: "next_step", label: "Next step" },
  { value: "handoff", label: "Handoff" },
  { value: "internal", label: "Internal" },
];

const NOTE_TEMPLATES: Record<string, { label: string; body: string }[]> = {
  general: [
    {
      label: "Customer context",
      body: "Customer context:\n- Team size:\n- Current setup:\n- Main goal:\n- Risk to watch:\n",
    },
    {
      label: "Key takeaway",
      body: "Key takeaway:\n- What changed:\n- Why it matters:\n- Recommended follow-up:\n",
    },
  ],
  qualification: [
    {
      label: "Qualification snapshot",
      body: "Qualification snapshot:\n- Need:\n- Timeline:\n- Decision maker:\n- Budget signal:\n",
    },
    {
      label: "Fit assessment",
      body: "Fit assessment:\n- Use case fit:\n- Technical fit:\n- Urgency:\n- Confidence:\n",
    },
  ],
  objection: [
    {
      label: "Objection log",
      body: "Objection raised:\n- Topic:\n- Customer wording:\n- Response given:\n- Follow-up needed:\n",
    },
  ],
  next_step: [
    {
      label: "Action plan",
      body: "Next step plan:\n- Owner:\n- Action:\n- Due date:\n- Success condition:\n",
    },
  ],
  handoff: [
    {
      label: "Handoff brief",
      body: "Handoff brief:\n- Current status:\n- Pending questions:\n- Promised follow-up:\n- Recommended action:\n",
    },
  ],
  internal: [
    {
      label: "Internal note",
      body: "Internal note:\n- Context:\n- Dependency:\n- Caution:\n",
    },
  ],
};

export function NotesWorkspace({
  emptyBody,
  entityId,
  entityLabel,
  entityType,
  notes,
}: {
  entityType: string;
  entityId: string;
  entityLabel: string;
  notes: Note[] | undefined;
  emptyBody: string;
}) {
  const queryClient = useQueryClient();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const [draft, setDraft] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [isPinned, setIsPinned] = useState(false);

  const templates = NOTE_TEMPLATES[noteType] ?? NOTE_TEMPLATES.general;
  const orderedNotes = useMemo(
    () =>
      [...(notes ?? [])].sort((left, right) => {
        if (left.isPinned !== right.isPinned) {
          return left.isPinned ? -1 : 1;
        }
        return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
      }),
    [notes],
  );

  async function handleCreateNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const noteBody = draft.trim();
    if (!noteBody) {
      return;
    }

    await createNote.mutateAsync({
      data: {
        entityType,
        entityId,
        noteBody,
        noteType,
        isPinned,
      },
    });

    await queryClient.invalidateQueries({
      queryKey: getListNotesQueryKey({ entityType, entityId }),
    });

    setDraft("");
    setIsPinned(false);
  }

  async function togglePin(note: Note) {
    await updateNote.mutateAsync({
      id: note.id,
      data: {
        isPinned: !note.isPinned,
      },
    });

    await queryClient.invalidateQueries({
      queryKey: getListNotesQueryKey({ entityType, entityId }),
    });
  }

  function applyTemplate(body: string) {
    setDraft(body);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] bg-white/70 p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold">Add note</p>
          <p className="mt-1 text-sm text-muted">
            Capture structured internal context for this {entityLabel}, then pin the important notes to keep them visible.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleCreateNote}>
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <label className="space-y-2">
              <span className="text-sm font-medium">Note type</span>
              <select
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                onChange={(event) => setNoteType(event.target.value)}
                value={noteType}
              >
                {NOTE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-end">
              <span className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <input
                  checked={isPinned}
                  onChange={(event) => setIsPinned(event.target.checked)}
                  type="checkbox"
                />
                Pin this note on create
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Templates</p>
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <Button
                  key={template.label}
                  onClick={() => applyTemplate(template.body)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Note body</span>
            <textarea
              className="min-h-36 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Document context, decisions, blockers, or next steps."
              value={draft}
            />
          </label>

          <Button disabled={createNote.isPending || !draft.trim()} type="submit">
            {createNote.isPending ? "Saving..." : "Save note"}
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        {orderedNotes.length ? (
          orderedNotes.map((note) => (
            <FeedCard
              key={note.id}
              eyebrow={note.isPinned ? "Pinned note" : formatLabel(note.noteType)}
              title={formatLabel(note.noteType)}
              description={note.noteBody}
              meta={formatDateTime(note.updatedAt)}
            >
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted">
                  {note.isPinned ? "Pinned for quick visibility" : "Standard note"}
                </span>
                <Button
                  disabled={updateNote.isPending}
                  onClick={() => togglePin(note)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {note.isPinned ? "Unpin" : "Pin"}
                </Button>
              </div>
            </FeedCard>
          ))
        ) : (
          <EmptyPanel body={emptyBody} title="No notes yet" />
        )}
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatLabel(value: string) {
  return value
    .split(/[_-\s]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
