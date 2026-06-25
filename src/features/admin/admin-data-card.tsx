"use client";

import { AdminSearchInput, useAdminFilter } from "@/features/admin/admin-search";
import { Badge } from "@/components/ui/badge";

export function AdminDataCard({
  title,
  rows,
  searchPlaceholder,
  empty = "—",
}: {
  title: string;
  rows: { key: string; cells: string[] }[];
  searchPlaceholder: string;
  empty?: string;
}) {
  const rowRecords = rows.map((r) => ({
    key: r.key,
    c0: r.cells[0] ?? "",
    c1: r.cells[1] ?? "",
    c2: r.cells[2] ?? "",
  }));
  const { query, setQuery, filtered } = useAdminFilter(rowRecords, ["c0", "c1", "c2"]);

  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <AdminSearchInput value={query} onChange={setQuery} placeholder={searchPlaceholder} />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {filtered.map((row) => (
            <li
              key={row.key}
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
            >
              <span className="truncate font-medium">{row.c0}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{row.c1}</span>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {row.c2}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
