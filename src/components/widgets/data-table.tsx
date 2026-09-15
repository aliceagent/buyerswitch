"use client";

import { useMemo, useState } from "react";
import { useUiStore } from "@/stores/app-stores";

export interface Column<T> {
  id: string;
  header: string;
  sortValue?: (row: T) => string | number | null;
  cell: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  total,
  page,
  pageSize,
  onPage,
  search,
  onSearch,
  onSelectionChange,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  search?: string;
  onSearch?: (q: string) => void;
  onSelectionChange?: (ids: string[]) => void;
  empty: string;
}) {
  const density = useUiStore((s) => s.density);
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const an = av ?? "";
      const bn = bv ?? "";
      const cmp = an < bn ? -1 : an > bn ? 1 : a.id.localeCompare(b.id);
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, columns]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      {onSearch ? (
        <input
          className="mb-2 rounded border border-border px-2 py-1 text-[13px]"
          placeholder="Search"
          value={search ?? ""}
          onChange={(e) => onSearch(e.target.value)}
        />
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border">
              {onSelectionChange ? <th className="w-8" /> : null}
              {columns.map((c) => (
                <th key={c.id} className="px-2 py-2 font-medium">
                  <button
                    type="button"
                    className="tabular"
                    onClick={() =>
                      setSort((s) =>
                        s?.id === c.id ? { id: c.id, dir: s.dir === "asc" ? "desc" : "asc" } : { id: c.id, dir: "desc" },
                      )
                    }
                  >
                    {c.header}
                    {sort?.id === c.id ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td className="px-2 py-6 text-ink-muted" colSpan={columns.length + 1}>
                  {empty}
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr key={row.id} style={{ height: density === "compact" ? 34 : 44 }} className="border-b border-border">
                  {onSelectionChange ? (
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(row.id);
                          else next.delete(row.id);
                          setSelected(next);
                          onSelectionChange([...next]);
                        }}
                      />
                    </td>
                  ) : null}
                  {columns.map((c) => (
                    <td key={c.id} className="px-2 tabular">
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px]">
        <span>
          {total} rows · page {page} of {pages}
        </span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            Previous
          </button>
          <button type="button" disabled={page >= pages} onClick={() => onPage(Math.min(pages, page + 1))}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
