import { Check, X } from "lucide-react";
import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm rounded-lg border border-zinc-200 bg-white p-3 shadow-panel dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid h-7 w-7 place-items-center rounded-md ${
            isError ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          }`}
        >
          {isError ? <X size={16} /> : <Check size={16} />}
        </span>
        <p className="text-sm text-zinc-800 dark:text-zinc-100">{toast.message}</p>
        <button
          type="button"
          title="Dismiss"
          onClick={onClose}
          className="ml-auto rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

