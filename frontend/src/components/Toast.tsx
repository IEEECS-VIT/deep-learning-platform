"use client";
import { useToastStore } from "@/store/toastStore";

export default function Toast() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(20px);
          }
        }

        .toast-enter {
          animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .toast-exit {
          animation: slideOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
      {toasts.map((toast) => {
        const isError = toast.type === "error";
        const baseClasses = `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] ${
          toast.isExiting ? "toast-exit" : "toast-enter"
        }`;
        const colorClasses = isError
          ? "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.15)] text-[#f87171]"
          : "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.15)] text-[#34d399]";

        return (
          <div key={toast.id} className={`${baseClasses} ${colorClasses}`}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isError ? (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </>
              ) : (
                <path d="M20 6L9 17l-5-5" />
              )}
            </svg>
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
