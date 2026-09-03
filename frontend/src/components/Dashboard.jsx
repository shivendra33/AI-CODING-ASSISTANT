import { Bot, Code2, FileCode, FolderOpen, Loader2, MessageSquare, Save, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api, apiError } from "../services/api";
import { modes } from "./Sidebar";

const quickActions = ["generate", "debug", "explain", "optimize"];

export default function Dashboard({ onQuickAction, onOpenConversation, showToast }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadSummary() {
    setLoading(true);
    try {
      const { data } = await api.get("/dashboard/summary");
      setSummary(data);
    } catch (error) {
      showToast(apiError(error, "Could not load dashboard."), "error");
    } finally {
      setLoading(false);
    }
  }

  async function openSession(id) {
    try {
      const { data } = await api.get(`/conversations/${id}`);
      onOpenConversation(data);
    } catch (error) {
      showToast(apiError(error, "Could not open session."), "error");
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="animate-spin text-emerald-500" size={28} />
      </div>
    );
  }

  const stats = [
    { label: "AI requests", value: summary?.total_ai_requests ?? 0, icon: Bot },
    { label: "Sessions", value: summary?.total_conversations ?? 0, icon: MessageSquare },
    { label: "Saved snippets", value: summary?.saved_snippets ?? 0, icon: Save },
    { label: "Top language", value: summary?.most_used_language ?? "Python", icon: Code2 }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Dashboard</p>
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Coding activity</h1>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</span>
                <span className="grid h-8 w-8 place-items-center rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  <Icon size={17} />
                </span>
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Wand2 size={18} className="text-emerald-600" />
            <h2 className="text-base font-semibold">Quick actions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((id) => {
              const mode = modes.find((item) => item.id === id);
              const Icon = mode.icon;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onQuickAction(id)}
                  className="flex min-h-24 items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:shadow-panel dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{mode.label}</span>
                    <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">Open workspace</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <FolderOpen size={18} className="text-cyan-600" />
            <h2 className="text-base font-semibold">Recent sessions</h2>
          </div>
          <div className="space-y-3">
            {summary?.recent_sessions?.length ? (
              summary.recent_sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => openSession(session.id)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 text-left transition hover:border-cyan-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-cyan-800"
                >
                  <span>
                    <span className="block text-sm font-medium">{session.title}</span>
                    <span className="mt-1 block text-xs capitalize text-zinc-500 dark:text-zinc-400">{session.mode}</span>
                  </span>
                  <FileCode size={18} className="shrink-0 text-zinc-400" />
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                No sessions yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

