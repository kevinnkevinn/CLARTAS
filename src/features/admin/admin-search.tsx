"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function useAdminFilter<T extends Record<string, string>>(
  rows: T[],
  keys: (keyof T)[],
  initial = "",
) {
  const [query, setQuery] = useState(initial);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
    );
  }, [rows, keys, query]);
  return { query, setQuery, filtered };
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
