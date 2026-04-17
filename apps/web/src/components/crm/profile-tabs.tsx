"use client";

import type { ReactNode } from "react";

export interface ProfileTabItem {
  id: string;
  label: string;
  count?: number;
}

export function ProfileTabBar({
  activeTab,
  onChange,
  tabs,
}: {
  activeTab: string;
  onChange: (tabId: string) => void;
  tabs: ProfileTabItem[];
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const selected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            className={[
              "rounded-full px-4 py-2 text-sm font-medium transition",
              selected
                ? "bg-slate-900 text-white"
                : "bg-white/70 text-slate-700 hover:bg-white",
            ].join(" ")}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className={selected ? "ml-2 text-slate-300" : "ml-2 text-slate-500"}>
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyPanel({
  body,
  title,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white/70 px-5 py-6">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}

export function FeedCard({
  eyebrow,
  title,
  description,
  meta,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white/70 px-4 py-4">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{eyebrow}</p> : null}
      <div className="mt-1 flex items-start justify-between gap-4">
        <p className="font-semibold">{title}</p>
        {meta ? <span className="text-xs text-muted">{meta}</span> : null}
      </div>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      {children}
    </div>
  );
}
