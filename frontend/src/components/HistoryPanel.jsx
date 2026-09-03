import { Check, FolderOpen, Loader2, Pencil, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { api, apiError } from "../services/api";

export default function HistoryPanel({ onOpenConversation, showToast }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  async function loadItems() {
    setLoading(true);
    try {
      const { data } = await api.get("/conversations", { params: { search } });
      setItems(data);
    } catch (error) {
      showToast(apiError(error, "Could not load history."), "error");
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(id) {
    try {
      const { data } = await api.get(`/conversations/${id}`);
      onOpenConversation(data);
    } catch (error) {
      showToast(apiError(error, "Could not open conversation."), "error");
    }
  }

  async function renameConversation(id) {
    if (!draftTitle.trim()) return;
    try {
      await api.patch(`/conversations/${id}`, { title: draftTitle.trim() });
      setEditingId(null);
      showToast("Conversation renamed.");
      loadItems();
    } catch (error) {
      showToast(apiError(error, "Could not rename conversation."), "error");
    }
  }

  async function deleteConversation(id) {
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await api.delete(`/conversations/${id}`);
      showToast("Conversation deleted.");
      loadItems();
    } catch (error) {
      showToast(apiError(error, "Could not delete conversation."), "error");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadItems, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Chat History</p>
          <h1 className="text-2xl font-semibold">Previous coding sessions</h1>
        </div>
        <label className="flex h-10 min-w-72 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
          <Search size={16} className="text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sessions"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      {loading ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="animate-spin text-emerald-500" size={28} />
        </div>
      ) : items.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200">
                  <FolderOpen size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  {editingId === item.id ? (
                    <input
                      value={draftTitle}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      className="form-control h-9"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => openConversation(item.id)}
                      className="block max-w-full truncate text-left text-sm font-semibold hover:text-emerald-700 dark:hover:text-emerald-300"
                    >
                      {item.title}
                    </button>
                  )}
                  <p className="mt-1 text-xs capitalize text-zinc-500 dark:text-zinc-400">{item.mode}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {editingId === item.id ? (
                    <>
                      <button
                        type="button"
                        title="Save title"
                        onClick={() => renameConversation(item.id)}
                        className="icon-button"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        title="Cancel rename"
                        onClick={() => setEditingId(null)}
                        className="icon-button"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      title="Rename conversation"
                      onClick={() => {
                        setEditingId(item.id);
                        setDraftTitle(item.title);
                      }}
                      className="icon-button"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Delete conversation"
                    onClick={() => deleteConversation(item.id)}
                    className="icon-button hover:text-rose-600 dark:hover:text-rose-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          No matching conversations.
        </div>
      )}
    </section>
  );
}

