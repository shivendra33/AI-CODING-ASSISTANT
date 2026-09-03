import { Copy, Download, Loader2, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api, apiError } from "../services/api";

function extensionFor(language) {
  const map = {
    Python: "py",
    JavaScript: "js",
    TypeScript: "ts",
    Java: "java",
    "C++": "cpp",
    C: "c",
    Go: "go",
    Rust: "rs",
    PHP: "php"
  };
  return map[language] || "txt";
}

export default function SavedSnippets({ onOpenSnippet, showToast }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    setLoading(true);
    try {
      const { data } = await api.get("/snippets", { params: { search } });
      setItems(data);
    } catch (error) {
      showToast(apiError(error, "Could not load snippets."), "error");
    } finally {
      setLoading(false);
    }
  }

  async function copySnippet(code) {
    try {
      await navigator.clipboard.writeText(code);
      showToast("Snippet copied.");
    } catch {
      showToast("Clipboard permission is unavailable.", "error");
    }
  }

  function downloadSnippet(item) {
    const blob = new Blob([item.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${item.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${extensionFor(item.language)}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function deleteSnippet(id) {
    if (!window.confirm("Delete this snippet?")) return;
    try {
      await api.delete(`/snippets/${id}`);
      showToast("Snippet deleted.");
      loadItems();
    } catch (error) {
      showToast(apiError(error, "Could not delete snippet."), "error");
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
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Saved Snippets</p>
          <h1 className="text-2xl font-semibold">Reusable code library</h1>
        </div>
        <label className="flex h-10 min-w-72 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
          <Search size={16} className="text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search snippets"
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
              className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => onOpenSnippet(item)}
                  className="min-w-0 text-left"
                >
                  <span className="block truncate text-sm font-semibold hover:text-emerald-700 dark:hover:text-emerald-300">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{item.language}</span>
                </button>
                <div className="flex shrink-0 gap-1">
                  <button type="button" title="Copy snippet" onClick={() => copySnippet(item.code)} className="icon-button">
                    <Copy size={16} />
                  </button>
                  <button type="button" title="Download snippet" onClick={() => downloadSnippet(item)} className="icon-button">
                    <Download size={16} />
                  </button>
                  <button
                    type="button"
                    title="Delete snippet"
                    onClick={() => deleteSnippet(item.id)}
                    className="icon-button hover:text-rose-600 dark:hover:text-rose-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <pre className="max-h-60 overflow-auto bg-zinc-950 p-4 font-mono text-xs leading-5 text-zinc-100">
                <code>{item.code}</code>
              </pre>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          No saved snippets.
        </div>
      )}
    </section>
  );
}

