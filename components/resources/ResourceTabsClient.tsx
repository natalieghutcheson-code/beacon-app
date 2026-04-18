"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RESOURCE_ITEMS,
  RESOURCE_TABS,
  type ResourceTabId,
} from "@/lib/resources-data";

export function ResourceTabsClient() {
  const [tab, setTab] = useState<ResourceTabId>("guides");
  const activeMeta = RESOURCE_TABS.find((t) => t.id === tab)!;
  const items = RESOURCE_ITEMS.filter((i) => i.tab === tab);

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 border-b border-[#E8E0D0] pb-4 mb-6"
        role="tablist"
        aria-label="Resource formats"
      >
        {RESOURCE_TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="resource-tabpanel-active"
              id={`resource-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                selected
                  ? "bg-[#2D4A2D] text-white shadow-sm"
                  : "bg-white text-charcoal/60 border border-[#E8E0D0] hover:border-[#C8BCA8] hover:text-charcoal"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <p
        className="text-sm text-charcoal/55 mb-6 max-w-3xl"
        id="resource-tabpanel-active"
        role="tabpanel"
        aria-labelledby={`resource-tab-${tab}`}
      >
        {activeMeta.description}
      </p>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 list-none p-0 m-0">
        {items.map((item) => (
          <li key={item.id}>
            <article className="h-full flex flex-col bg-white rounded-2xl border border-[#E8E0D0] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-[#BEB4A8] hover:shadow-lg transition-all duration-200">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-[#F0F5F0] text-[#2D4A2D] border border-[#BDD4BD]">
                  {item.typeBadge}
                </span>
                <span className="text-xs text-charcoal/45">{item.topic}</span>
              </div>
              <h3 className="font-display text-lg text-charcoal leading-snug mb-2">{item.title}</h3>
              <p className="text-sm text-charcoal/60 leading-relaxed flex-1 mb-4">{item.description}</p>
              <Link
                href={item.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2D4A2D] hover:text-[#1e3320] transition-colors group w-fit"
              >
                {item.cta}
                <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
