"use client";

import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
};

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "bg-brand text-brand-foreground shadow-soft"
              : "bg-white text-foreground ring-1 ring-border hover:bg-brand/5"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
