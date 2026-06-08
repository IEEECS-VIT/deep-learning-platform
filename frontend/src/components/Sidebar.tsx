"use client";
import { useMemo, useState } from "react";
import { usePipelineStore } from "@/store/pipelineStore";
import { buildSidebarCategories } from "@/lib/nodePresentation";
import type { NodeMetadataEntry } from "@/lib/configSchema";

interface SidebarProps {
  nodeMetadata: Record<string, NodeMetadataEntry>;
}

export default function Sidebar({ nodeMetadata }: SidebarProps) {
  const categories = useMemo(
    () => buildSidebarCategories(nodeMetadata),
    [nodeMetadata],
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { addNode } = usePipelineStore();

  const toggle = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("nodeType", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDoubleClick = (nodeType: string) => {
    addNode(nodeType, {
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 150,
    });
  };

  if (!categories.length) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <p className="text-[12px] text-white/40 text-center">
          Loading available nodes...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-[10px]">
        {categories.map((cat) => {
          const isCollapsed = collapsed[cat.label] ?? false;
          return (
            <div key={cat.label} className="mb-2">
              <button
                onClick={() => toggle(cat.label)}
                className="w-full flex items-center justify-between px-2 py-[6px] bg-transparent border-0 cursor-pointer text-white/40 text-[11px] font-semibold tracking-[0.05em]"
              >
                <span>{cat.label.toUpperCase()}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {!isCollapsed && (
                <div className="flex flex-col gap-[6px] mt-1">
                  {cat.nodes.map(({ type, presentation }) => (
                    <div
                      key={type}
                      draggable
                      onDragStart={(e) => onDragStart(e, type)}
                      onDoubleClick={() => onDoubleClick(type)}
                      className="flex items-center gap-[10px] px-3 py-[10px] rounded-[10px] border cursor-grab overflow-hidden"
                      style={{
                        borderColor: presentation.border,
                        background: presentation.bg,
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 text-[11px] font-bold"
                        style={{
                          background: `${presentation.color}22`,
                          color: presentation.color,
                        }}
                      >
                        {presentation.label.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[12px] font-semibold text-white truncate">
                          {presentation.label}
                        </p>
                        <p className="mt-[2px] m-0 text-[11px] text-white/40 truncate">
                          {presentation.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
