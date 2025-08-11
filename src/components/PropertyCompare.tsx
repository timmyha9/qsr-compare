"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QSRProperty } from "../lib/notion";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface Props {
  initialProperties: QSRProperty[];
}

/* ---------------- helpers ---------------- */
const isNum = (v: any) => !isNaN(parseFloat(v)) && isFinite(v);

const fmt = (
  v: any,
  t: "dollar" | "percent" | "number" | null = null
): string => {
  if (v == null || v === "" || v === "NF") return "—";
  if (typeof v === "string" && !isNum(v)) return v;
  const n = Number(v);
  switch (t) {
    case "dollar":
      return `$${n.toLocaleString()}`;
    case "percent":
      return `${n.toFixed(2)}%`;
    case "number":
      return n.toLocaleString();
    default:
      return `${v}`;
  }
};

const makeArrow = (
  a: any,
  b: any,
  higherBetter = true
): React.ReactNode => {
  if (isNum(a) && isNum(b) && a !== b) {
    const isBetter = higherBetter ? Number(a) > Number(b) : Number(a) < Number(b);
    return (
      <span className={`ml-1 ${isBetter ? "text-green-500" : "text-red-500"}`}>
        {isBetter ? "▲" : "▼"}
      </span>
    );
  }
  return null;
};

/* ---------------- component --------------- */
export default function PropertyCompare({ initialProperties }: Props) {
  const [sortField, setSortField] = useState<
    "price" | "capRate" | "noi" | "reviewStatus"
  >("reviewStatus");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<QSRProperty[]>([]);
  const [open, setOpen] = useState<string[]>([]);

  const toggle = (p: QSRProperty) => {
    setSelected((prev) => {
      if (prev.find((x) => x.id === p.id)) return prev.filter((x) => x.id !== p.id);
      if (prev.length < 2) return [...prev, p];
      return [prev[1], p]; // replace first
    });
  };

  const toggleOpen = (id: string) => {
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const FIELDS: [
    string,
    keyof QSRProperty,
    "higher" | "lower" | false,
    "dollar" | "percent" | "number" | null
  ][] = [
    ["Address", "address", false, null],
    ["Cap Rate", "capRate", "higher", "percent"],
    ["Price", "price", "lower", "dollar"],
    ["NOI", "noi", "higher", "dollar"],
    ["Lease Type", "leaseType", false, null],
    ["Rent Increases", "rentIncreases", false, null],
    ["Options", "options", false, null],
    ["Term Remaining", "termRemaining", false, null],
    ["Population (1 mile)", "pop1Mile", "higher", "number"],
    ["Population (3 mile)", "pop3Mile", "higher", "number"],
    ["Median Income", "medIncome", "higher", "dollar"],
    ["VPD", "vpd", "higher", "number"],
    ["Building Size", "buildingSize", false, null],
    ["Lot Size", "lotSize", false, null],
    ["Guarantor", "guarantor", false, null],
    ["Property Stats", "propertyStats", false, null],
  ];

  return (
    <div className="relative bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/white-carbon.png')] opacity-10" />
      <div className="relative z-10 px-4 py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 bg-white p-4 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="mt-1 w-44 rounded border px-2 py-1 text-sm shadow-sm"
            >
              <option value="price">Price</option>
              <option value="capRate">Cap Rate</option>
              <option value="noi">NOI</option>
              <option value="reviewStatus">Review Status</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Direction</label>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as any)}
              className="mt-1 w-28 rounded border px-2 py-1 text-sm shadow-sm"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {[...initialProperties]
              .sort((a, b) => {
                if (sortField === "reviewStatus") {
                  const order = { Reviewing: 0, Bought: 1, Reviewed: 2 } as const;
                  const av =
                    order[(a.reviewStatus as keyof typeof order) ?? "Reviewing"];
                  const bv =
                    order[(b.reviewStatus as keyof typeof order) ?? "Reviewing"];
                  return sortDirection === "asc" ? av - bv : bv - av;
                }
                const aVal = Number((a as any)[sortField] ?? 0);
                const bVal = Number((b as any)[sortField] ?? 0);
                return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
              })
              .map((p) => {
                const sel = selected.some((s) => s.id === p.id);
                const expanded = open.includes(p.id);

                const statusClasses =
                  p.reviewStatus === "Bought"
                    ? "border-yellow-400 bg-yellow-50"
                    : p.reviewStatus === "Reviewed"
                    ? "border-gray-400 bg-gray-100"
                    : "border-gray-300 bg-white"; // Reviewing / default

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => toggle(p)}
                    className={`cursor-pointer rounded-lg border p-4 shadow-md transition hover:ring-2 hover:ring-blue-400
                      ${sel ? "ring-2 ring-green-500" : ""}
                      ${statusClasses}
                    `}
                  >
                    <div className="overflow-hidden rounded mb-2 h-40 w-full">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-black mb-1 flex items-center gap-2">
                        {p.name}

                        {/* Bought → 'Previously Bought' */}
                        {p.reviewStatus === "Bought" && (
                          <span className="rounded bg-yellow-300 px-2 py-0.5 text-xs font-medium text-yellow-900">
                            Previously Bought
                          </span>
                        )}

                        {/* Reviewed → 'Reviewed' */}
                        {p.reviewStatus === "Reviewed" && (
                          <span className="rounded bg-gray-300 px-2 py-0.5 text-xs font-medium text-gray-800">
                            Reviewed
                          </span>
                        )}
                      </h3>

                      {sel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOpen(p.id);
                          }}
                          aria-label="Toggle details"
                        >
                          <motion.div
                            animate={{ rotate: expanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                          </motion.div>
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">{p.address}</p>

                    {p.salePdfUrl && (
                      <a
                        href={p.salePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 inline-block text-blue-600 text-sm underline hover:text-blue-800"
                      >
                        View Sale PDF
                      </a>
                    )}

                    {expanded && (
                      <div className="mt-3 space-y-1 text-sm text-black">
                        {FIELDS.map(([lbl, key, , fmtType]) => (
                          <p key={lbl}>
                            <strong>{lbl}:</strong>{" "}
                            {fmt((p as any)[key], fmtType)}
                          </p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        {selected.length > 0 && (
          <div className="fixed bottom-4 left-0 w-full flex justify-center z-50 pointer-events-none">
            <button
              onClick={() => {
                setSelected([]);
                setOpen([]);
              }}
              className="pointer-events-auto rounded bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-red-700"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* comparison table */}
        {selected.length === 2 && (
          <motion.div
            layout
            className="mt-10 rounded-lg bg-slate-800 p-6 text-white shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="mb-6 text-center text-2xl font-semibold">Comparison</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="sticky top-0 z-10 bg-slate-900">
                  <tr>
                    <th className="p-3 text-left">Attribute</th>
                    {selected.map((s) => (
                      <th key={s.id} className="p-3 text-left">
                        <div className="flex items-center gap-2">
                          <img
                            src={s.imageUrl}
                            className="h-8 w-8 rounded object-cover"
                            alt={s.name}
                          />
                          {s.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {FIELDS.map(([lbl, key, cmp, fmtType]) => {
                    const v1 = (selected[0] as any)[key];
                    const v2 = (selected[1] as any)[key];
                    if (fmt(v1, fmtType) === "—" && fmt(v2, fmtType) === "—")
                      return null;
                    const arrL = cmp ? makeArrow(v1, v2, cmp === "higher") : null;
                    const arrR = cmp ? makeArrow(v2, v1, cmp === "higher") : null;
                    return (
                      <tr key={lbl} className="border-t">
                        <td className="p-2 font-medium text-gray-400">{lbl}</td>
                        <td className="p-2">
                          {fmt(v1, fmtType)}
                          {arrL}
                        </td>
                        <td className="p-2">
                          {fmt(v2, fmtType)}
                          {arrR}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
