"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyPanel, FeedCard } from "@/components/crm/profile-tabs";

const DEFAULT_VISIBLE_ITEMS = 5;
const LONG_DESCRIPTION_LIMIT = 180;

export interface ProfileTimelineItem {
  id: string;
  category: string;
  eyebrow?: string;
  title: string;
  description?: string | null;
  timestamp: string;
  searchText?: string;
}

export function ProfileTimelineBrowser({
  emptyBody,
  emptyTitle,
  items,
  noResultsBody = "Try adjusting the search or filter to widen the timeline.",
}: {
  items: ProfileTimelineItem[];
  emptyTitle: string;
  emptyBody: string;
  noResultsBody?: string;
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const deferredSearch = useDeferredValue(search);

  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }

    return [
      { id: "all", label: "All", count: items.length },
      ...Array.from(counts.entries()).map(([id, count]) => ({
        id,
        label: formatLabel(id),
        count,
      })),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter = activeFilter === "all" || item.category === activeFilter;
      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        item.category,
        item.eyebrow,
        item.title,
        item.description,
        item.searchText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [activeFilter, deferredSearch, items]);

  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, DEFAULT_VISIBLE_ITEMS);

  function handleFilterChange(filterId: string) {
    setActiveFilter(filterId);
    setShowAll(false);
  }

  function toggleExpandedItem(itemId: string) {
    setExpandedItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] bg-white/70 p-4">
        <div className="flex flex-col gap-3">
          <Input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search timeline"
            value={search}
          />
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const selected = filter.id === activeFilter;
              return (
                <Button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  size="sm"
                  type="button"
                  variant={selected ? "default" : "outline"}
                >
                  {filter.label}
                  <span className="ml-2 opacity-80">{filter.count}</span>
                </Button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <span>
              Showing {visibleItems.length} of {filteredItems.length} matching items
            </span>
            {filteredItems.length > DEFAULT_VISIBLE_ITEMS ? (
              <Button
                onClick={() => setShowAll((current) => !current)}
                size="sm"
                type="button"
                variant="ghost"
              >
                {showAll ? `Collapse to ${DEFAULT_VISIBLE_ITEMS}` : `Show all ${filteredItems.length}`}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {!items.length ? (
          <EmptyPanel body={emptyBody} title={emptyTitle} />
        ) : !filteredItems.length ? (
          <EmptyPanel body={noResultsBody} title="No matching timeline items" />
        ) : (
          visibleItems.map((item) => {
            const fullDescription = item.description ?? "";
            const isExpanded = Boolean(expandedItems[item.id]);
            const shouldTruncate = fullDescription.length > LONG_DESCRIPTION_LIMIT;
            const description =
              shouldTruncate && !isExpanded
                ? `${fullDescription.slice(0, LONG_DESCRIPTION_LIMIT).trimEnd()}...`
                : item.description;

            return (
              <FeedCard
                key={item.id}
                eyebrow={item.eyebrow ?? formatLabel(item.category)}
                title={item.title}
                description={description}
                meta={formatDateTime(item.timestamp)}
              >
                {shouldTruncate ? (
                  <div className="mt-3">
                    <Button
                      onClick={() => toggleExpandedItem(item.id)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      {isExpanded ? "Collapse details" : "Expand details"}
                    </Button>
                  </div>
                ) : null}
              </FeedCard>
            );
          })
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
