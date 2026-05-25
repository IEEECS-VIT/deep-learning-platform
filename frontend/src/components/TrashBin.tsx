"use client";
import { forwardRef } from "react";

interface TrashBinProps {
  isDragging: boolean;
  isOverTrash: boolean;
}

const TrashBin = forwardRef<HTMLDivElement, TrashBinProps>(({ isDragging, isOverTrash }, ref) => (
  <div
    ref={ref}
    className={`mb-4 w-8 h-8 rounded-lg flex items-center justify-center pointer-events-none transition-all duration-200 ${
      isDragging ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
    } ${isOverTrash ? "bg-red-500/10" : "bg-transparent"}`}
    style={{
      boxShadow: isOverTrash ? "0 0 32px 12px rgba(239,68,68,0.3)" : "none",
      transition: "opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.15s ease, box-shadow 0.15s ease",
    }}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={isOverTrash ? "#ef4444" : "rgba(255,255,255,0.4)"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-150"
    >
      <g
        style={{
          transformOrigin: "3px 6px",
          transform: isOverTrash ? "rotate(-35deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }}
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
      </g>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  </div>
));

TrashBin.displayName = "TrashBin";
export default TrashBin;