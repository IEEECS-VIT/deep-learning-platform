"use client";
import { useState } from "react";
import { usePipelineStore } from "@/store/pipelineStore";

const categories = [
  {
    label: "Data",
    nodes: [
      { type: "dataset", label: "Dataset", desc: "Load a dataset", color: "#7c3aed", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.25)", icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/> },
      { type: "train_test_split", label: "Train-Test Split", desc: "Split data into train and test sets", color: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)", icon: <><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></> },
    ],
  },
  {
    label: "Preprocessing",
    nodes: [
      { type: "preprocess", label: "Preprocess", desc: "Scale and preprocess data", color: "#d97706", bg: "rgba(217,119,6,0.12)", border: "rgba(217,119,6,0.25)", icon: <><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></> },
    ],
  },
  {
    label: "Model",
    nodes: [
      { type: "model", label: "Model", desc: "Train a machine learning model", color: "#059669", bg: "rgba(5,150,105,0.12)", border: "rgba(5,150,105,0.25)", icon: <><rect x="2" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M5 9v4h14V9M12 13v2"/></> },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ Data: false, Preprocessing: false, Model: false });
  const { addNode } = usePipelineStore();

  const toggle = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("nodeType", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDoubleClick = (nodeType: string) => {
    addNode(nodeType, { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 });
  };

  return (
    <div className="w-[260px] bg-[#111114] border-r border-white/[0.06] flex flex-col shrink-0">
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <p className="m-0 text-[13px] font-semibold text-white">Available Nodes</p>
        <p className="mt-[3px] m-0 text-[11px] text-white/35">Drag nodes to the canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-[10px]">
        {categories.map((cat) => (
          <div key={cat.label} className="mb-2">
            <button
              onClick={() => toggle(cat.label)}
              className="w-full flex items-center justify-between px-2 py-[6px] bg-transparent border-0 cursor-pointer text-white/40 text-[11px] font-semibold tracking-[0.05em]"
            >
              <span>{cat.label.toUpperCase()}</span>
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: collapsed[cat.label] ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {!collapsed[cat.label] && (
              <div className="flex flex-col gap-[6px] mt-1">
                {cat.nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    onDoubleClick={() => onDoubleClick(node.type)}
                    className="flex items-center gap-[10px] px-3 py-[10px] rounded-[10px] border cursor-grab"
                    style={{ borderColor: node.border, background: node.bg }}
                  >
                    <div
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                      style={{ background: `${node.color}22` }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={node.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        {node.icon}
                      </svg>
                    </div>
                    <div>
                      <p className="m-0 text-[12px] font-semibold text-white">{node.label}</p>
                      <p className="mt-[2px] m-0 text-[11px] text-white/40">{node.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}